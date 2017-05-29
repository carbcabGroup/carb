#import collections
import urllib
import requests
import time, datetime
import webbrowser, os, sys, subprocess

class reqOAuth2Public:
    def __init__(self, **kwargs):
        self.params = kwargs
        self.token = None

    def get(self, path="", **kwargs):
        # Check/get token
        if self.token is None:
            self.updateToken()
        elif self.token['expires_in'] < datetime.datetime.now():
            self.updateToken()

        return self.callAPI(path, **kwargs)

    def getSimple(self, url, path="", headers={}, **kwargs):
        if len(path) != 0:
            if path[0] != '/':
                path = '/' + path
            url = url + path
        r = requests.get(url, headers=headers, params=kwargs)
        # note: cleanly handled invalid requests will still succeed
        try:
            return r.json()
        except:
            print url
            print headers
            print kwargs
            print (repr(r.text))[:1023]
            return r

    def postSimpleAuth(self, user, auth, url, path="", headers={}, **kwargs):
        if len(path) != 0:
            if path[0] != '/':
                path = '/' + path
            url = url + path
        r = requests.post(url, headers=headers, data=kwargs, auth=(user, auth))
        # note: cleanly handled invalid requests will still succeed
        try:
            return r.json()
        except:
            print url
            print headers
            print kwargs
            print (repr(r.text))[:1023]
            return r

    def getToken(self):
        #self.headers = {'Content-Type': 'application/json'}
        headers = {}
        return self.postSimpleAuth(self.params['client_id'],
                                   self.params['client_secret'],
                                   self.params['url'],
                                   path=self.params['token_path'],
                                   headers=headers,
                                   grant_type='client_credentials',
                                   scope=self.params['scope'])

    def updateToken(self):
        t_issue = datetime.datetime.now()
        token_info = self.getToken()
        t_exp = t_issue + datetime.timedelta(seconds=token_info['expires_in'])
        token_info['expires_in'] = t_exp
        self.token = token_info

    def callAPI(self, path="", **kwargs):
        headers = {'Authorization' : 'Bearer %s' % self.token['access_token']}
        return self.getSimple(self.params['url'], path=path, headers=headers, **kwargs)

class reqOAuth2Private:
    def __init__(self, user_id, user_auth, **kwargs):
        self.user_id = user_id
        self.user_auth = user_auth
        self.params = kwargs

    # try provided user:
    #   a) check db for existing (possibly expired) tokens
    #   b) refresh or get authorization to get new token
    def get(self, path="", **kwargs):
        # find user details
        print "Searching for user \"" + self.user_id + "\""
        userdata = self.getUserInfo()
        print "User details:"
        print userdata

        # examine uber tokens
        tokendata = userdata['lyft_token']
        print "Current tokens:"
        print tokendata
        if len(tokendata) == 0: # initialize/refresh if empty
            print "Creating blank token"
            self.makeEmptyToken()
            userdata = self.getUserInfo()
            tokendata = userdata['lyft_token']
        print "Using tokens:"
        print tokendata
        # token exists
        tokendata_id = tokendata[0]
        # follow details to auth info
        t_data = self.getTokenData(tokendata_id)
        print "Selected token:"
        print t_data
        # check if auth up to date
        t_exp = t_data['access_token_exp']
        if t_exp is not None: # contains actual token data
            if datetime.datetime.now() < self.dbstrToDatetime(t_exp): # fresh?
                print "Using valid token"
                return self.callAPI(t_data['access_token'], path, **kwargs)
            else: # refresh
                # undocumented but should return same as new token
                print "Refreshing token"
                t_issue = datetime.datetime.now()
                r = self.refreshToken(t_data['refresh_token'])
                print r
                self.saveToken(tokendata_id, r, t_issue)

                # call API
                print "Using valid token"
                access_token = r['access_token']
                return self.callAPI(access_token, path, **kwargs)
        #  no valid tokens
        # 1) auth via system default browser
        print "Redirecting user to authorization..."
        state = t_data['auth_uuid']
        t_start = datetime.datetime.now() # ensure new to ignore previous
        self.getUserAuth(state) # redirect to uber auth
        # uber redirects to auth.uber.com (302) and then
        # login.uber.com (200) to present user with login first,
        # eventually directs to preset redirect with state/code;
        # webserver listening at redirect saves code in db

        #print r.status_code
        #print (repr(r.headers))[:1023]
        #print (repr(r.text))[:1023]
        #print r.history
        #print r.url

        # 2) receive code from webserver via database
        print "Waiting for user authorization..."
        auth_code = self.receiveAuthCode(tokendata_id, t_start)

        print "Received authorization:"
        print auth_code
        if auth_code is not None:
            # 3) exchange for token
            # actually coming few moments from now,
            # so token will expire slightly early
            t_issue = datetime.datetime.now()
            r = self.getToken(auth_code)
            print r
            self.saveToken(tokendata_id, r, t_issue)

            # 4) call API
            access_token = r['access_token']
            return self.callAPI(access_token, path, **kwargs)
        return None

    def getSimple(self, url, path="", headers={}, **kwargs):
        if len(path) != 0:
            if path[0] != '/':
                path = '/' + path
            url = url + path
        r = requests.get(url, headers=headers, params=kwargs)
        # note: cleanly handled invalid requests will still succeed
        try:
            return r.json()
        except:
            print url
            print headers
            print kwargs
            print (repr(r.text))[:1023]
            return r

    def postSimpleAuth(self, user, auth, url, path="", headers={}, **kwargs):
        if len(path) != 0:
            if path[0] != '/':
                path = '/' + path
            url = url + path
        r = requests.post(url, headers=headers, data=kwargs, auth=(user, auth))
        # note: cleanly handled invalid requests will still succeed
        try:
            return r.json()
        except:
            print url
            print headers
            print kwargs
            print (repr(r.text))[:1023]
            return r

    def getUserInfo(self):
        db_addr = "http://52.15.168.69:8088/"
        db_path = "users/"
        url = db_addr + db_path
        headers = {'Authorization': 'JWT %s' % self.user_auth}
        params = {'search': self.user_id}
        r = requests.get(url=url, headers=headers, params=params)
        return r.json()['results'][0]

    def makeEmptyToken(self):
        db_addr = "http://52.15.168.69:8088/"
        db_path = "lyft_tokens/"
        url = db_addr + db_path
        headers = {'Authorization': 'JWT %s' % self.user_auth}
        return requests.post(url, headers=headers)

    def getTokenData(self, tokendata_id):
        db_addr = "http://52.15.168.69:8088/"
        db_path = "lyft_tokens/" + str(tokendata_id) + '/'
        url = db_addr + db_path
        headers = {'Authorization': 'JWT %s' % self.user_auth}
        r = requests.get(url=url, headers=headers)
        return r.json()

    def dbstrToDatetime(self, db_string):
        # e.g.: "2017-05-20T00:03:35.273808Z"
        t_format = "%Y-%m-%dT%H:%M:%S.%fZ"
        return datetime.datetime.strptime(db_string, t_format)

    # params: client_id, response_type (code)
    # opt params: scope, state, redirect_uri
    def getUserAuth(self, state):
        query_string = urllib.urlencode({'client_id': self.params['client_id'],
                                         'response_type': self.params['response_type'],
                                         'state': state,
                                         'scope': self.params['scope']})
        url = self.params['auth_url'] + self.params['auth_path'] \
              + '?' + query_string
        print url
        try:
            webbrowser.open(url)
        except webbrowser.Error:
            if sys.platform == 'win32':
                os.startfile(url)
            elif sys.platform == 'darwin':
                subprocess.Popen(['open', url])
            else:
                try:
                    subprocess.Popen(['xdg-open', url])
                except OSError:
                    print 'Please open a browser on: ' + url

    def receiveAuthCode(self, tokendata_id, t_start):
        wait_count = 5
        wait_time = 10
        while wait_count > 0:
            t_data = self.getTokenData(tokendata_id)
            auth_code = t_data['auth_code']
            t_updated = self.dbstrToDatetime(t_data['updated'])
            if auth_code == "" or t_updated < t_start:
                time.sleep(wait_time)
                wait_count -= 1
                wait_time *= 2
                print "No response, waiting " + str(wait_time) + "s before retrying"
            else: # some kind of code was recently added
                return auth_code
        return None # timed out

    def getToken(self, auth_code):
        headers = {}
        return self.postSimpleAuth(self.params['client_id'], self.params['client_secret'], self.params['auth_url'], path=self.params['token_path'], headers=headers, grant_type='authorization_code', code=auth_code)

    def refreshToken(self, token):
        headers = {}
        return self.postSimpleAuth(self.params['client_id'], self.params['client_secret'], self.params['auth_url'], path=self.params['token_path'], headers=headers, grant_type='refresh_token', refresh_token=token)

    def saveToken(self, tokendata_id, token_info, t_issue):
        db_addr = "http://52.15.168.69:8088/"
        db_path = "lyft_tokens/" + str(tokendata_id) + '/'
        url = db_addr + db_path
        headers = {'Authorization': 'JWT %s' % self.user_auth}
        t_exp = t_issue + datetime.timedelta(seconds=token_info['expires_in'])
        data = {'access_token': token_info['access_token'],
                'access_token_exp': t_exp,
                'refresh_token': token_info['refresh_token'],
                'auth_scope': token_info['scope']}
        r = requests.put(url=url, headers=headers, data=data)
        return r

    def callAPI(self, access_token, path="", **kwargs):
        headers = {'Authorization' : 'Bearer %s' % access_token}
        return self.getSimple(self.params['api_url'], path=path, headers=headers, **kwargs)

# curl -X POST -H "Content-Type: application/json" \
#      --user "QqAbDFOkY0gi:qRCAyP0pLs3v-vlD9nz2vDgPbcSUhD1O" \
#      -d '{"grant_type": "client_credentials", "scope": "public"}' \
#      'https://api.lyft.com/oauth/token'
