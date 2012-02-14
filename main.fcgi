#!/home1/wimaxlyc/python272/bin/python -tt
# -*- coding: UTF-8 -*-

from cgi import escape
import sys, os

def app(environ, start_response):
    import news2ru
    start_response('200 OK', [('Content-Type', 'text/plain')])
    return [news2ru.getNews()]
    
    #yield '<h1>FastCGI Environment</h1>'
    #yield '<table>'
    #for k, v in sorted(environ.items()):
        #yield '<tr><th>%s</th><td>%s</td></tr>' % (escape(k), escape(v))
        #yield '<tr><th>%s</th><td>%s</td></tr>' % (repr(k), repr(v))
    #yield '</table>'

if __name__ == '__main__':
    from flup.server.fcgi import WSGIServer
    WSGIServer(app).run()
