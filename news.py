# -*- coding: utf-8 -*-

from gevent import monkey
monkey.patch_all()
import gevent

import urllib
import urllib2
import json
#from json import encoder
#encoder.FLOAT_REPR = lambda o: format(o, '.2f')
import random
import re
import math
from datetime import datetime,timedelta
import time
import lxml.html
#import chardet
import errno
import os


def printTime(string,ref=None):
    pass
    return
    try:
        ms = time.time()*1000.0
        a = datetime.now()
        str_time = a.strftime("%Y-%m-%d %H-%M-%S")+"."+"%03d" % (a.microsecond/1000)
        if(ref is not None):
            d = a-ref
            print str_time + ':' + string + ' [' + str(d.total_seconds()) + ']'
            #print d
        else:
            print str_time + ':' + string
        return a
    except ValueError:
        print "Oops!  That was no valid number.  Try again..."    
    except:
        print "Unexpected error"
        raise
    
    
def num (s):
    try:
        return int(s)
    except ValueError:
        return 0    

def normalize(data,limit=None):
    if limit is not None:
#        print [ item['popularity'] for item in elem['children'] ]
        data = sorted(data,key=lambda o: o['popularity'],reverse=True)
#        print [ item['popularity'] for item in elem['children'] ]
        data = data[0:limit]
#        print [ item['popularity'] for item in elem['children'] ]

    # 10..1000000
    a = 10
    b = 1000000
        # x..y (z)
        # a..b (c?)
        
        # (z-x)/(y-x) = (c-a)/(b-a)
        # (z-x)*(b-a)/(y-x) = c - a
        # c = (z-x)*(b-a)/(y-x) + a
         
    for index,item in enumerate(data):
        item['popularity'] = float(item['socialactivity'])/(index+1)
        #if( 'popularity' not item)
        #item['popularity'] = math.pow(1.2, len(data)-index+1 )
        item['socialactivity'] = item['socialactivity']
    
    if(len(data)>0):
        minP = float(min(data, key=lambda k: k['popularity'])['popularity'])-.001
        maxP = float(max(data, key=lambda k: k['popularity'])['popularity'])+.001
        minS = float(min(data, key=lambda k: k['socialactivity'])['socialactivity'])-.001
        maxS = float(max(data, key=lambda k: k['socialactivity'])['socialactivity'])+.001
    
       
        #print (minP,maxP,minS,maxS)
        
    for index,item in enumerate(data):
        #print repr(item['link']) +':' + repr(item['popularity']) + '\t' + repr(item['socialactivity'])
        if( maxS>minS ):
            item['socialactivity'] = (float(item['socialactivity'])-minS)*(b-a)/(maxS-minS)+a

        if( maxP>minP ):
            item['popularity'] = (float(item['popularity'])-minP)*(b-a)/(maxP-minP)+a

        #print repr(item['link']) +':' + repr(item['popularity']) + '\t' + repr(item['socialactivity'])
    
    return data
        
def getNews2Ru(url):
    startTime=printTime("!news2ru: "+url)
    data = {}
    data['name'] = url
    data['children'] = []
    try:
        req = urllib2.Request(url)
        req.add_header('User-agent', 'Mozilla/5.0')
        
        #printTime("before urlopen... "+url)
#        html = lxml.html.parse(url).getroot()

        response = urllib2.urlopen(req)
        doc=response.read()
        html = lxml.html.document_fromstring( doc )        


        #print lxml.html.tostring(html)
        #response = urllib2.urlopen(req)        
        #printTime("...urlopen done "+ url)
        #print lxml.html.tostring(html)
        #print dir(html)
        
        parseTime = printTime("!!news2ru: "+url,startTime)
        for index,news_placeholder in enumerate(html.find_class('news_placeholder')):
            id=news_placeholder.get('id').split('_')[1]
            #print 'ID',id
            votes = num(news_placeholder.xpath(".//div[@id='vote_num_"+id+"']/a/text()")[0])
            #print 'votes =',votes
            href = 'http://news2.ru/story/'+id
            title_elem=news_placeholder.xpath(".//h3[@id='news_title_"+id+"']/a/text()")[0]
            title = title_elem
            desc_elem=news_placeholder.find(".//div[@id='news_description_"+id+"']")
            desc=''#desc_elem.text
            img_elem = news_placeholder.find('.//img')
            img_elem.set('src','http://news2.ru'+img_elem.get('src'))
            
            
            comm_elem = news_placeholder.xpath(".//div[@class='comments_ico']/a/text()")[0]
            comments = num(comm_elem.split()[0])

            data['children'].append({})
            data['children'][index]['link'] = href
            #data['children'][index]['name'] = '<span>'+title+'</span>'
            data['children'][index]['rawvotes'] =  votes 
            data['children'][index]['description'] = desc
            data['children'][index]['img'] = lxml.etree.tostring(img_elem)
            data['children'][index]['rawcomments'] = comments
            data['children'][index]['title'] = title
            data['children'][-1]['id'] = int(id)
            data['children'][-1]['socialactivity'] = data['children'][index]['rawcomments']+data['children'][index]['rawvotes']
            data['children'][-1]['popularity'] =  len(data['children'])
        return data
    except IOError as (errno):
        print "I/O error({0})".format(errno)
    finally:
        printTime("#news2ru: "+url,parseTime)
        return data

def getHelp():    
    data = {}
    data['name'] = 'help'
    data['children'] = []
    
    data['children'].append({})
    data['children'][-1]['link'] = "http://novomapia.com/"
    data['children'][-1]['socialactivity'] =  len(data['children'])
    data['children'][-1]['popularity'] =  len(data['children'])
    data['children'][-1]['description'] = ''
    data['children'][-1]['img'] = ''
    data['children'][-1]['title'] = '<span style="color:grey">TODO: цвет шрифта определяет давность новости, \
                                    настройка параметров и запоминание настроек в кукисах</span>'
    data['children'][-1]['id'] = len(data['children'])

    data['children'].append({})
    data['children'][-1]['link'] = "http://en.wikipedia.org/wiki/Treemapping"
    data['children'][-1]['socialactivity'] =  1
    data['children'][-1]['popularity'] =  1
    data['children'][-1]['description'] = ''
    data['children'][-1]['img'] = ''
    data['children'][-1]['title'] = 'Treemap - алгоритм визуализации иерархии набора данных. \
                                    Отображается в виде набора вложенных прямоугольников, каждый из которых является ветвью дерева, \
                                    а находящиеся внутри него — дочерними элементами и ветвями. \
                                    Прямоугольники различаются по размеру в зависимости от параметра и имеют цвет, который задается другим параметром'
    data['children'][-1]['id'] = len(data['children'])

    data['children'].append({})
    data['children'][-1]['link'] = "http://novomapia.com/"
    data['children'][-1]['socialactivity'] =  len(data['children'])
    data['children'][-1]['popularity'] =  len(data['children'])-1
    data['children'][-1]['description'] = ''
    data['children'][-1]['img'] = ''
    data['children'][-1]['title'] = '...это просто красиво...'
    data['children'][-1]['id'] = len(data['children'])
    
    
    data['children'].append({})
    data['children'][-1]['link'] = "http://mbostock.github.com/d3/"
    data['children'][-1]['socialactivity'] =  len(data['children'])
    data['children'][-1]['popularity'] =  len(data['children'])
    data['children'][-1]['description'] = ''
    data['children'][-1]['img'] = ''
    data['children'][-1]['title'] = '...использует библиотеку d3.js...'
    data['children'][-1]['id'] = len(data['children'])
    
    data['children'].append({})
    data['children'][-1]['link'] = "http://newsmap.jp/"
    data['children'][-1]['socialactivity'] =  len(data['children'])
    data['children'][-1]['popularity'] =  len(data['children'])
    data['children'][-1]['description'] = ''
    data['children'][-1]['img'] = ''
    data['children'][-1]['title'] = '...идея "украдена" вот отсюда: http://newsmap.jp...'
    data['children'][-1]['id'] = len(data['children'])
   
    data['children'].append({})
    data['children'][-1]['link'] = "http://novomapia.com/"
    data['children'][-1]['socialactivity'] =  len(data['children']) + 9
    data['children'][-1]['popularity'] =  len(data['children'])
    data['children'][-1]['description'] = ''
    data['children'][-1]['img'] = ''
    data['children'][-1]['title'] = 'не очень важная, но <b><span style="color:orange">горячо</span> обсуждаемая</b>'
    data['children'][-1]['id'] = len(data['children'])
    
    data['children'].append({})
    data['children'][-1]['link'] = "http://novomapia.com/"
    data['children'][-1]['socialactivity'] =  len(data['children'])
    data['children'][-1]['popularity'] =  len(data['children'])
    data['children'][-1]['description'] = ''
    data['children'][-1]['img'] = ''
    data['children'][-1]['title'] = 'количество <b>комментариев</b>  определяет <b>цвет</b> новости'
    data['children'][-1]['id'] = len(data['children'])

    data['children'].append({})
    data['children'][-1]['link'] = "http://novomapia.com/"
    data['children'][-1]['socialactivity'] =  len(data['children'])
    data['children'][-1]['popularity'] =  len(data['children'])
    data['children'][-1]['description'] = ''
    data['children'][-1]['img'] = ''
    data['children'][-1]['title'] = '<b>размер</b> новости соответствует её важности'
    data['children'][-1]['id'] = len(data['children'])
    
    data['children'].append({})
    data['children'][-1]['link'] = "http://novomapia.com/"
    data['children'][-1]['socialactivity'] =  len(data['children'])
    data['children'][-1]['popularity'] =  len(data['children'])
    data['children'][-1]['description'] = ''
    data['children'][-1]['img'] = ''
    data['children'][-1]['title'] = 'каждой новости соответствует определенный цвет и размер'
    data['children'][-1]['id'] = len(data['children'])

    data['children'].append({})
    data['children'][-1]['link'] = "http://novomapia.com/"
    data['children'][-1]['socialactivity'] =  len(data['children'])
    data['children'][-1]['popularity'] =  len(data['children'])
    data['children'][-1]['description'] = ''
    data['children'][-1]['img'] = ''
    data['children'][-1]['title'] = '<b>новоmapia</b> это новый способ узнавать самые важные и самые обсуждаемые новости'
    data['children'][-1]['id'] = len(data['children'])

    data['children'].append({})
    data['children'][-1]['link'] = "http://novomapia.com/"
    data['children'][-1]['socialactivity'] =  len(data['children'])
    data['children'][-1]['popularity'] =  len(data['children'])
    data['children'][-1]['description'] = ''
    data['children'][-1]['img'] = ''
    data['children'][-1]['title'] = '<b>новоmapia</b> покажет вам новости по новому'
    data['children'][-1]['id'] = len(data['children'])

    data['children'].append({})
    data['children'][-1]['link'] = "http://novomapia.com/"
    data['children'][-1]['socialactivity'] = len(data['children'])-10
    data['children'][-1]['popularity'] = len(data['children'])
    data['children'][-1]['description'] = ''
    data['children'][-1]['img'] = ''
    data['children'][-1]['title'] = '<b>важная</b>, но <span style="color: #777777">бледненькая</span> мало обсуждаемая новость'
    data['children'][-1]['id'] = len(data['children'])
    
    return json.dumps(data)

def getMembranaPage(url):
    startTime = printTime("!membrana: "+url)
    data = {}
    data['name'] = url
    data['children'] = []
    try:
        req = urllib2.Request(url)
        req.add_header('User-agent', 'Mozilla/5.0')        
        response = urllib2.urlopen(req)        
        doc=response.read()
        doc=unicode(doc,'windows-1251')
        html = lxml.html.document_fromstring( doc )        
        parseTime=printTime("!!membrana: "+url,startTime)
        for index,news in enumerate(html.find_class('list-article')):
            title=news.xpath(".//h3/a/text()")[0]
            comments_elem = news.xpath(".//div[@class='extras']/a/text()")
            if(len(comments_elem)>0):
                comments = num(comments_elem[0].split()[0])
            else:
                comments = 0

            #a = news.xpath(".//div[@class='extras']/a")[0].get('href')
            #print repr(a.get('href'))
            
            href = news.xpath(".//h3/a/@href")[0] #[0].get('href')
            id = href.split('/')[1]
            
            data['children'].append({})
            data['children'][-1]['link'] = 'http://membrana.ru/'+href
            data['children'][-1]['socialactivity'] =  comments
            data['children'][-1]['popularity'] =  len(data['children'])
            data['children'][-1]['description'] = ''
            data['children'][-1]['img'] = ''
            data['children'][-1]['title'] = title
            data['children'][-1]['id'] = num(id)

        return data
    except IOError as (errno):
        print "I/O error({0})".format(errno)
    finally:
        printTime("#membrana: "+url,parseTime)
        return data        

def getHabrPage(url):
    startTime= printTime("!habr: "+url)
    data = {}
    data['name'] = url
    data['children'] = []
    try:

        req = urllib2.Request(url)
        req.add_header('User-agent', 'NovoMapia.com/1.0')        
        response = urllib2.urlopen(req)        
        doc=response.read()
        #print doc[:50]
        #response.close()
        #doc=unicode(doc,'windows-1251')
        html = lxml.html.document_fromstring( doc )        
        parseTime = printTime("!!habr: "+url, startTime)
        for index,news in enumerate(html.find_class('post')):
            title=news.xpath(".//a[@class='post_title']/text()")[0]
            comments_elem = news.xpath(".//div[@class='comments']//span[@class='all']/text()")
            if(len(comments_elem)>0):
                comments = num(comments_elem[0].split()[0])
            else:
                comments = 0
            
            href = news.xpath(".//a[@class='post_title']/@href")[0]
            ''#news.xpath(".//h3/a/@href")[0] #[0].get('href')
            id = news.get('id').split('_')[1]
            
            #print href, comments, id
            
            data['children'].append({})
            data['children'][-1]['link'] = href
            data['children'][-1]['socialactivity'] =  comments
            data['children'][-1]['popularity'] =  len(data['children'])
            data['children'][-1]['description'] = ''
            data['children'][-1]['img'] = ''
            data['children'][-1]['title'] = title
            data['children'][-1]['id'] = num(id)

        return data
    except urllib2.URLError, e:
        print repr(e)
    except IOError, e:
        print "I/O error(%s): %s" % (e.errno, "strerror")
    except:
        print "Unexpected error: "+url
    finally:
        printTime("#habr: "+url,parseTime)
        return data

def getRamblerPage(url):
    #import cookielib
    startTime=printTime("!rambler: "+url)
    data = {}
    data['name'] = url
    data['children'] = []
    try:
        
#        cj = cookielib.CookieJar()
#        opener = urllib2.build_opener(urllib2.HTTPCookieProcessor(cj))
#        urllib2.install_opener(opener)
        
        txheaders =  {'User-agent' : 'Mozilla/5.0 (Windows NT 5.1; rv:9.0.1) Gecko/20100101 Firefox/9.0.1'}
        req = urllib2.Request(url,None,txheaders)
        
        response = urllib2.urlopen(req)
        
#        for index, cookie in enumerate(cj):
#            print index, '  :  ', cookie
        
        doc=response.read()
        #doc=unicode(doc,'windows-1251')
        #print doc
        html = lxml.html.document_fromstring( doc )        
        #print lxml.html.tostring(html)
        parseTime=printTime("!!rambler : "+url,startTime)
        
        for index,news in enumerate(html.xpath(".//div[@class='b_topic.news']/div")):
            #print lxml.html.tostring(news)
            title_elem=news.xpath(".//a[contains(@class,'title')]")
            if(len(title_elem)==0): continue
            title = title_elem[0].text
            #print title.encode('utf-8')            
            href = 'http://old.news.rambler.ru'+title_elem[0].get('href')
            id = title_elem[0].get('href').strip('/')
                        
            #print 'href=',href
            comments_elem = []#news.xpath(".//div[@class='comments']//span[@class='all']/text()")
            if(len(comments_elem)>0):
                comments = num(comments_elem[0].split()[0])
            else:
                comments = 0
                        
            #print href, comments, id
            
            
            data['children'].append({})
            data['children'][-1]['link'] = href
            data['children'][-1]['socialactivity'] =  comments
            data['children'][-1]['popularity'] =  len(data['children'])
            data['children'][-1]['description'] = ''
            data['children'][-1]['img'] = ''
            data['children'][-1]['title'] = title
            data['children'][-1]['id'] = num(id)
        
        
        ids = [repr(i['id']) for i in data['children']]
        print ids
        comments = getRamblerComments(','.join(ids))
        
        for index,elem in enumerate(data['children']):
            if(elem['id'] in comments):
                elem['socialactivity'] = comments[elem['id']]
            else:
                elem['socialactivity'] = 1
        
    except IOError as (errno):
        print "I/O error({0})".format(errno)
    finally:
        printTime("#rambler: "+url,parseTime)
        return data

def getRamblerComments(id):
    #ids = [repr(i['id']) for i in news]
    #params = urllib.urlencode({'thread_ids': ','.join(ids)})
    params = urllib.urlencode({'thread_ids': id})
    #print 'http://old.news.rambler.ru/comments/counts/'+params
    req = urllib2.Request('http://old.news.rambler.ru/comments/counts/?'+params)
    req.add_header('User-agent', 'Mozilla/5.0')
    req.add_header('X-Requested-With','XMLHttpRequest\r\n')
    response = urllib2.urlopen(req)
    doc=response.read()
    #print 'doc=',doc
    res1 = json.loads(doc)
    res2 = {}
    for key in res1.iterkeys():
        res2[int(key)] = int(res1[key])
    #print res2
    return res2

sources = {
    'news2ru' : 
    {
        'function' : getNews2Ru,
        'urls' : [ "http://news2.ru/page0", "http://news2.ru/page1" ],
        'id' : 123424567
    },
    'habr' :
    {
        'function' : getHabrPage,
        'urls' : [ "http://habrahabr.ru/top/weekly/page1/", "http://habrahabr.ru/top/weekly/page2/",  "http://habrahabr.ru/top/weekly/page3/" ],
        'id' : 145234567
    },
    'rambler' :
    {
        'function' : getRamblerPage,
        'urls' : [ "http://old.news.rambler.ru/head/?page=1", "http://old.news.rambler.ru/head/?page=2", "http://old.news.rambler.ru/head/?page=3" ],
        'id' : 435624562,
    },
    'membrana' :
    {
        'function' : getMembranaPage,
        'urls' : [ "http://www.membrana.ru/particles?page=1", "http://www.membrana.ru/particles?page=2", "http://www.membrana.ru/particles?page=3" ],
        'id' : 756245625
    }    
}

def removeDuplicates(list,func):
    outlist = []
    ids = set()
    for e in list:
        if( func(e) in ids ):
            print "duplicate id "+repr(func(e))
            continue
        ids.add(func(e))
        outlist.append( e )
    return outlist

def getNews(srcs):
    jobs = []
    for index,src in enumerate(srcs):
        print [ url for url in sources[src]['urls']]
        sources[src]['jobs'] = [gevent.spawn(sources[src]['function'], url) for url in sources[src]['urls']]
        jobs = jobs + sources[src]['jobs']
    
    gevent.joinall( jobs )

    data = {}
    data['name'] = 'news'
    data['children'] = []
    data['id']=999999999
    for index,src in enumerate(srcs):
        result = [ job.get() for job in sources[src]['jobs'] ]
        #print src + ":" + repr(len(result))
        elem = {}
        elem['name'] = src
        elem['id'] = sources[src]['id']
        #print [ item for item in result]
        elem['children'] = [ item for innerlist in result for item in innerlist['children'] ]
               
        elem['children']=normalize(elem['children'])
        elem['children']=removeDuplicates(elem['children'],lambda o: o['id'])

        data['children'].append(elem)
    return json.dumps(data,indent=2)
    
if __name__ == '__main__':
    s = printTime("__main__ start")  
    #print    
    #getNews(['news2ru','membrana','habr','rambler'])    
    #print    
    getNews(['rambler'])    
    e = printTime("__main__ end",s)