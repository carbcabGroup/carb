import urllib
import requests
#import collections
import uuid
import webbrowser, os, sys, subprocess
import django

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
    def __init__(self, **kwargs):
        self.params = kwargs

    # either:
    #   a) try provided token (may need refresh),
    #   b) try provided user (check db, may need refresh),
    #   c) no token
    def get(self, path="", **kwargs):
        # a)
        if "access_token" in self.params.keys():
            return getOAuth2CallAPI(self.params['access_token'], path, **kwargs)

        # b)

        # c)
        # 1) auth via system default browser
        state = str(uuid.uuid4())
        self.getOAuth2Auth(state) # redirect to uber auth
        # uber redirects to auth.uber.com (302) and then
        # login.uber.com (200) to present user with login first
        # eventually directs to redirect with state/code

        #print r.status_code
        #print (repr(r.headers))[:1023]
        #print (repr(r.text))[:1023]
        #print r.history
        #print r.url

        # 2) receive code from webserver via database
        auth_code = getOAuth2ReceiveCode(self, state)

        # 3) exchange for token
        r = getOAuth2GetToken(self, auth_code)
        print r.json()

        # 4) call API
        access_token = r.json()['access_token']
        getOAuth2CallAPI(access_token, path, **kwargs)

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

    # params: client_id, response_type (code)
    # opt params: scope, state, redirect_uri
    def getOAuth2Auth(self, state):
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

    def getOAuth2ReceiveCode(self, state):
        return

    def getOAuth2GetToken(self, auth_code):
        headers = {}
        return getSimple(self.params['auth_url'], path=self.params['token_path'], headers=headers, client_secret=self.params['client_secret'], client_id=self.params['client_id'], grant_type='authorization_code', redirect_uri=self.params['redirect_uri'], code=auth_code)

    def getOAuth2CallAPI(self, access_token, path="", **kwargs):
        headers = {'Authorization' : 'Bearer %s' % access_token}
        return getSimple(self.api_url, path=path, headers=headers, **kwargs)

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
    # 1) auth
    auth_url = "https://login.uber.com"
    auth_path = "/oauth/v2/authorize"
    token_path = "/oauth/v2/token"
    response_type = "code"
    redirect_uri = "https://127.0.0.1:8000/carbuberauth"

    api_url = "https://sandbox-api.uber.com"
    api_path = "/v1.2/products"

    t = reqOAuth2(client_id=client_id,
                  client_secret=client_secret, server_token=server_token,
                  auth_url=auth_url, auth_path=auth_path, token_path=token_path,
                  response_type=response_type, redirect_uri=redirect_uri)
    json = t.get(path=api_path, latitude=41.884441, longitude=-87.628503)

    print json

if __name__ == '__main__':
    main()
