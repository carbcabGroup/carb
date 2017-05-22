import urllib
import requests
#import collections
#import uuid
import time, datetime
import webbrowser, os, sys, subprocess

# simple request only needs additional server token
class reqSimple:
    def __init__(self, url="", server_token=""):
        self.url = url # need validate ends without '/'
        self.headers = {'Authorization': 'Token %s' % server_token}

    def get(self, path="", **kwargs):
        if len(path) == 0:
            url = self.url
        else:
            if path[0] != '/':
                path = '/' + path
            url = self.url + path
        r = requests.get(url, headers=self.headers, params=kwargs)
        # note: cleanly handled invalid requests will still succeed
        try:
            return r.json()
        except:
            print url
            print self.headers
            print kwargs
            print (repr(r.text))[:1023]
            return r

class reqOAuth2:
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
        tokendata = userdata['uber_token']
        print "Current tokens:"
        print tokendata
        if len(tokendata) == 0: # initialize/refresh if empty
            print "Creating blank token"
            self.makeEmptyToken()
            userdata = self.getUserInfo()
            tokendata = userdata['uber_token']
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

    def postSimple(self, url, path="", headers={}, **kwargs):
        if len(path) != 0:
            if path[0] != '/':
                path = '/' + path
            url = url + path
        r = requests.post(url, headers=headers, data=kwargs)
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
        params = {'search': self.user_id}
        r = requests.get(url=url, params=params,
                         auth=(self.user_id, self.user_auth))
        return r.json()['results'][0]

    def makeEmptyToken(self):
        db_addr = "http://52.15.168.69:8088/"
        db_path = "uber_tokens/"
        url = db_addr + db_path
        return requests.post(url, auth=(self.user_id, self.user_auth))

    def getTokenData(self, tokendata_id):
        db_addr = "http://52.15.168.69:8088/"
        db_path = "uber_tokens/" + str(tokendata_id) + '/'
        url = db_addr + db_path
        r = requests.get(url=url,
                         auth=(self.user_id, self.user_auth))
        return r.json()

    def dbstrToDatetime(self, db_string):
        # e.g.: "2017-05-20T00:03:35.273808Z"
        t_format = "%Y-%m-%dT%H:%M:%S.%fZ"
        return datetime.datetime.strptime(db_string, t_format)

    # params: client_id, response_type (code)
    # opt params: scope, state, redirect_uri
    def getUserAuth(self, state):
        query_string = urllib.urlencode({'response_type': self.params['response_type'],
                                         'client_id': self.params['client_id'],
                                         'state': state,
                                         'redirect_uri': self.params['redirect_uri']})
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
        return self.postSimple(self.params['auth_url'], path=self.params['token_path'], headers=headers, client_secret=self.params['client_secret'], client_id=self.params['client_id'], grant_type='authorization_code', redirect_uri=self.params['redirect_uri'], code=auth_code)

    def refreshToken(self, token):
        headers = {}
        return self.postSimple(self.params['auth_url'], path=self.params['token_path'], headers=headers, client_secret=self.params['client_secret'], client_id=self.params['client_id'], grant_type='refresh_token', refresh_token=token)

    def saveToken(self, tokendata_id, token_info, t_issue):
        db_addr = "http://52.15.168.69:8088/"
        db_path = "uber_tokens/" + str(tokendata_id) + '/'
        url = db_addr + db_path
        t_exp = t_issue + datetime.timedelta(seconds=token_info['expires_in'])
        data = {'access_token': token_info['access_token'],
                'access_token_exp': t_exp,
                'refresh_token': token_info['refresh_token'],
                'auth_scope': token_info['scope']}
        r = requests.put(url=url, data=data,
                         auth=(self.user_id, self.user_auth))
        return r

    def callAPI(self, access_token, path="", **kwargs):
        headers = {'Authorization' : 'Bearer %s' % access_token}
        return self.getSimple(self.params['api_url'], path=path, headers=headers, **kwargs)

def printDiv():
    print
    print "=================="
    print


def main():
    client_id = "8mbR_i3W8ekCHYeb4xcCKbi__9OLx2pu"
    client_secret = "m1S9NG_UtuK2zMlUyOktpBc2e3R60GtyTCAgZ7qD"
    server_token = "EJ0pcAbk9USM4McsYzCLOkYphlnmxWvElOEdxV74"

    # API Token (app server token)
    url = "https://sandbox-api.uber.com"
    path = "/v1.2/products"

    # fail: missing api args
    t = reqSimple(url=url, server_token=server_token)
    json = t.get(path=path)
    print json
    printDiv()

    # success: full request
    json = t.get(path=path, latitude=41.884441, longitude=-87.628503)
    print json
    printDiv()

    # for i in json:
    #     print i
    #     for k in json[i]:
    #         for j,v in k.iteritems():
    #             print j, ":", v
    #         print

    # OAuth2 (client-provider-server)
    user_id = "sptest"
    user_auth = "spsp"

    auth_url = "https://login.uber.com"
    auth_path = "/oauth/v2/authorize"
    token_path = "/oauth/v2/token"
    response_type = "code"
    redirect_uri = "https://127.0.0.1:8000/carbuberauth"

    api_url = "https://sandbox-api.uber.com"
    api_path = "/v1.2/products"

    t = reqOAuth2(user_id, user_auth, api_url=api_url, client_id=client_id,
                  client_secret=client_secret, server_token=server_token,
                  auth_url=auth_url, auth_path=auth_path, token_path=token_path,
                  response_type=response_type, redirect_uri=redirect_uri)
    json = t.get(path=api_path, latitude=41.884441, longitude=-87.628503)

    print json

if __name__ == '__main__':
    main()
