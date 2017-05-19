import requests
import collections

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
            return getOAuth2CallAPI(self.params['access_token'], path, kwargs)

        # b)

        # c)
        # 1) auth
        r = self.getOAuth2Auth() # redirect to uber login
        print r.status_code
        print (repr(r.headers))[:1023]
        print (repr(r.text))[:1023]

        # 2) receive code
        # 3) exchange for token
        # 4) call API

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
    def getOAuth2Auth(self):
        return self.getSimple(url=self.params['auth_url'],
                              path=self.params['auth_path'],
                              client_id=self.params['client_id'],
                              response_type=self.params['response_type'])

    def getOAuth2ReceiveCode(self):
        return

    def getOAuth2GetToken(self):
        return

    def getOAuth2CallAPI(self, access_token, path="", **kwargs):
        headers = {'Authorization' : 'Bearer %s' % access_token}
        return getSimple(self.api_url, path, headers, **kwargs)

def printDiv():
    print
    print "=================="
    print


def main():
    client_id = "8mbR_i3W8ekCHYeb4xcCKbi__9OLx2pu"
    client_secret = ""
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

    api_url = "https://sandbox-api.uber.com"
    api_path = "/v1.2/products"

    t = reqOAuth2(client_id=client_id,
                  client_secret=client_secret, server_token=server_token,
                  auth_url=auth_url, auth_path=auth_path, token_path=token_path,
                  response_type=response_type)
    json = t.get(path=api_path, latitude=41.884441, longitude=-87.628503)

    print json

if __name__ == '__main__':
    main()
