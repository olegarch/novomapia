# -*- coding: utf-8 -*-

from werkzeug.serving import run_simple
import main

run_simple('localhost', 8080, main.NovomapiaWsgiApp, use_reloader=True, use_debugger=True)