import requests
from carb_requests import reqSimple, reqOAuth2

def getUserToken(user_id, password):
    db_addr = "http://52.15.168.69:8088/"
    db_path = "api-token-auth/"
    url = db_addr + db_path
    data = {'username': user_id, 'password': password}
    r = requests.post(url=url, data=data)
    return r.json()

def refreshUserToken(token):
    db_addr = "http://52.15.168.69:8088/"
    db_path = "api-token-refresh/"
    url = db_addr + db_path
    data = {'token': token}
    r = requests.post(url=url, data=data)
    return r.json()

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
    user_pass = "spsp"

    auth_url = "https://login.uber.com"
    auth_path = "/oauth/v2/authorize"
    token_path = "/oauth/v2/token"
    response_type = "code"
    redirect_uri = "https://127.0.0.1:8000/carbuberauth"

    api_url = "https://sandbox-api.uber.com"
    api_path = "/v1.2/products"

    # get current auth token
    tokeninfo = getUserToken(user_id, user_pass)
    user_auth = tokeninfo['token']

    # make request on behalf of user
    t = reqOAuth2(user_id, user_auth, api_url=api_url, client_id=client_id,
                  client_secret=client_secret, server_token=server_token,
                  auth_url=auth_url, auth_path=auth_path, token_path=token_path,
                  response_type=response_type, redirect_uri=redirect_uri)
    json = t.get(path=api_path, latitude=41.884441, longitude=-87.628503)

    print json

if __name__ == '__main__':
    main()
