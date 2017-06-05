
import requests

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