#!/home1/wimaxlyc/python272/bin/python -tt
# -*- coding: UTF-8 -*-

import os
import urlparse
from werkzeug.wrappers import Request, Response
from werkzeug.routing import Map, Rule
from werkzeug.exceptions import HTTPException, NotFound
from werkzeug.wsgi import SharedDataMiddleware
from werkzeug.utils import redirect
from jinja2 import Environment, FileSystemLoader

import json
import news


class NovoMapia(object):
    
    def __init__(self, config):
        template_path = os.path.join(os.path.dirname(__file__), 'templates')
        self.jinja_env = Environment(loader=FileSystemLoader(template_path),autoescape=True)
        self.url_map = Map([
            Rule('/', endpoint='index'),
            Rule('/index.html', endpoint='index'),
            Rule('/<source>', endpoint='index'),
            Rule('/json/<source>', endpoint='json'),
            Rule('/json/<source>/', endpoint='json'),
        ])
    
    def render_template(self, template_name, **context):
        t = self.jinja_env.get_template(template_name)
        return Response(t.render(context), mimetype='text/html')

    def dispatch_request(self, request):
        return Response('Hello World!')
        
    def dispatch_request(self, request):
        adapter = self.url_map.bind_to_environ(request.environ)
        try:
            endpoint, values = adapter.match()
            return getattr(self, 'on_' + endpoint)(request, **values)
        except HTTPException, e:
            return e

    def wsgi_app(self, environ, start_response):
        request = Request(environ)
        response = self.dispatch_request(request)
        return response(environ, start_response)

    def __call__(self, environ, start_response):
        return self.wsgi_app(environ, start_response)

    def on_json(self, request, source):
        knownSources = [val for val in source.split('+') if val in news.sources.keys()]
        #print(repr(knownSources))
        if(len(knownSources)<=0): raise NotFound()
        return Response([news.getNews(knownSources)])

    def on_index(self, request, source='news2ru'):
        knownSources = [val for val in source.split('+') if val in news.sources.keys()]    
        if(len(knownSources)<=0 and source!='help'): raise NotFound()
        print json.dumps(source.split('+'),indent=2)
        return self.render_template('index.html', news_source=json.dumps(source.split('+')))
            
def create_app(with_static=True):
    app = NovoMapia({})
    if with_static:
        app.wsgi_app = SharedDataMiddleware(app.wsgi_app, {
            '/':  os.path.join(os.path.dirname(__file__), '')
        })
    return app

# if __name__ == '__main__':
    # from flup.server.fcgi import WSGIServer
    # application = create_app()
    # WSGIServer(application).run()
    
if __name__ == '__main__':
    from werkzeug.serving import run_simple
    app = create_app()
    run_simple('127.0.0.1', 5000, app, use_debugger=True, use_reloader=True)