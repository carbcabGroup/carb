import requests
import collections

class req:
    def __init__(self, **kwargs):
        self.params = collections.defaultdict(str)
        self.headers = dict()
        for k,v in kwargs.iteritems():
            if k == "url":
                if v[-1] != '/':
                    v = v + '/' 
                self.params[k] = v

    def getToken(self, path="", **kwargs):  
        self.headers = {'Content-Type': 'application/json'}

        if len(path) == 0:
            url = self.params['url']
        else:
            if path[0] == '/':
                path = path[1:]
            url = self.params['url'] + path
        
        r = requests.post(url, headers=self.headers, auth=(kwargs['client_id'], kwargs['client_secret']), data=kwargs['data'])
        
        if r.status_code == 200:
            return r.json()
        else:
            print r.status_code
            print r.headers
            print r.text

# curl -X POST -H "Content-Type: application/json" \
#      --user "QqAbDFOkY0gi:qRCAyP0pLs3v-vlD9nz2vDgPbcSUhD1O" \
#      -d '{"grant_type": "client_credentials", "scope": "public"}' \
#      'https://api.lyft.com/oauth/token'
            
def printDiv():
    print 
    print "=================="
    print


def main():
    url = "https://api.lyft.com/"
    client_secret = "qRCAyP0pLs3v-vlD9nz2vDgPbcSUhD1O"
    client_id = "QqAbDFOkY0gi"
    path = "/oauth/token"
    #Json need to be in string
    data = '{"grant_type": "client_credentials", "scope": "public"}'

    t = req(url=url)
    json = t.getToken(path=path, client_id=client_id, client_secret=client_secret, data=data)

    print json


if __name__ == '__main__':
    main()