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
            if k == "server_token":
                self.params[k] = v

    def get(self, path="", **kwargs):
        if self.params['server_token']:
            self.headers = {'Authorization' : 'Token %s' % self.params['server_token']}
        if len(path) == 0:
            url = self.params['url']
        else:
            if path[0] == '/':
                path = path[1:]
            url = self.params['url'] + path
        if len(kwargs) > 0:
            if self.headers:
                r = requests.get(url, headers=self.headers, params=kwargs)
            else:
                print url
                print kwargs
                r = requests.get(url, params=kwargs)
                print r.text
            try:
                return r.json()
            except:
                return r.text
        else:
            r = requests.get(url)
            try:
                return r.json()
            except:
                return r.headers
            
def printDiv():
    print 
    print "=================="
    print


def main():
    url = "https://sandbox-api.uber.com/"
    server_token = "EJ0pcAbk9USM4McsYzCLOkYphlnmxWvElOEdxV74"
    client_id = "8mbR_i3W8ekCHYeb4xcCKbi__9OLx2pu"
    path = "/v1.2/products"

    t = req(url=url, server_token=server_token)
    json = t.get(path=path, latitude=41.884441, longitude=-87.628503)

    print json

    printDiv()

    # for i in json:
    #     print i
    #     for k in json[i]:
    #         for j,v in k.iteritems():
    #             print j, ":", v
    #         print 
    path = "/oauth/v2/authorize"
    url = "https://login.uber.com/"
    t = req(url=url)
    json = t.get(path=path)
    print json



if __name__ == '__main__':
    main()
