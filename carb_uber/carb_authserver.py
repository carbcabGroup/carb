import BaseHTTPServer
import ssl
import requests

class HTTPAuthCodeHandler(BaseHTTPServer.BaseHTTPRequestHandler):
    def do_GET(self):
        print "Entered GET handler"
        print self.path
        req = self.path.split('?', 1)
        if len(req) == 2:
            path, params = req
            if path == "/carbuberauth":
                params = params.split('&')
                pdict = {}
                for p in params:
                    k, v = p.split('=')
                    pdict[k] = v
                # query by state and update code
                print "Querying/updating with:"
                print pdict
                try:
                    url = "http://52.15.168.69:8088/uber_tokens/"
                    headers = {}
                    params = {'search': pdict['state'].replace('-', '')}
                    r = requests.get(url=url, headers=headers, params=params,
                                     auth=('carbAdmin', 'squirthurt66'))
                    print "Retrieved query:"
                    print r.json()
                    user_row = r.json()['results'][0]
                    print "User access details:"
                    print user_row

                    url = url + str(user_row[u'id']) + '/'
                    print "Updating " + url + " ..."
                    data = {'auth_code': pdict['code']}
                    r = requests.put(url=url, headers=headers, data=data,
                                     auth=('carbAdmin', 'squirthurt66'))
                    print "PUT request status:"
                    print r.status_code
                    msg = "Authorization recorded."
                except:
                    msg = "Authorization couldn't be saved (database error)."
                # post client message
                # 1) send head
                try:
                    self.send_response(200)
                    self.send_header("Content-type", "text/plain")
                    self.send_header("Content-Length", len(msg))
                    self.end_headers()
                except:
                    raise
                # 2) send body
                try:
                    self.wfile.write(msg)
                except:
                    print "Response buffer write error"

if __name__ == '__main__':
    # run server
    server_address = ("127.0.0.1", 8000)
    print "Starting server at " + server_address[0] + ":" + str(server_address[1])
    httpd = BaseHTTPServer.HTTPServer(server_address, HTTPAuthCodeHandler)
    httpd.socket = ssl.wrap_socket(httpd.socket, keyfile='new.cert.key', certfile='new.cert.cert', server_side=True)
    run = True
    while run:
        print "Waiting for server request..."
        httpd.handle_request()

        more = raw_input("Continue (y/n)? ")
        if more != 'y':
            run = False
    print "Shutting down"
