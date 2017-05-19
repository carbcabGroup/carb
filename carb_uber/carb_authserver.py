import BaseHTTPServer
import ssl

import sys, os#, django

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
                    t = UberToken.objects.get(auth_uuid=pdict['state'])
                    t.auth_code = pdict['code']
                    t.save()
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
    # package-indifferent import
    if __package__ is None:
        from os import path
        sys.path.append(path.dirname(path.dirname(path.abspath(__file__))))
    from carb_db.carb_app.models import UberToken

    # db access init
    os.environ['DJANGO_SETTINGS_MODULE'] = 'carb_db.settings'
    django.setup()

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
