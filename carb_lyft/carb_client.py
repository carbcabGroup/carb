import requests
from carb_requests import reqOAuth2Public, reqOAuth2Private

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
    client_id = "QqAbDFOkY0gi"
    client_secret = "qRCAyP0pLs3v-vlD9nz2vDgPbcSUhD1O"

    url = "https://api.lyft.com"
    token_path = "/oauth/token"
    api_path = "/v1/eta"
    scope = 'public'

    # 2-legged: Public API
    #Json need to be in string
    #data = '{"grant_type": "client_credentials", "scope": "public"}'

    t = reqOAuth2Public(client_id=client_id, client_secret=client_secret,
                        url=url, token_path=token_path, scope=scope)
    json = t.get(path=api_path, lat=37.7833, lng=-122.4167)
    print json

    # 3-legged: User (Private) API
    user_id = "sptest"
    user_pass = "spsp"

    auth_path = "/oauth/authorize"
    response_type = "code"

    # get current auth token
    tokeninfo = getUserToken(user_id, user_pass)
    user_auth = tokeninfo['token']

    # make request on behalf of user
    t = reqOAuth2Private(user_id, user_auth, api_url=url, client_id=client_id,
                         client_secret=client_secret, auth_url=url,
                         auth_path=auth_path, token_path=token_path,
                         response_type=response_type, scope=scope)
    json = t.get(path=api_path, lat=37.7833, lng=-122.4167)
    print json

if __name__ == '__main__':
    main()
