# -*- coding: utf-8 -*-

import urllib
import urllib2
import json
import random
import re
import math
from datetime import datetime
import time
import lxml.html
#import chardet

def printTime(str):
    pass
    return
    ms = time.time()*1000.0
    a = datetime.now()
    str_time = a.strftime("%Y-%m-%d %H-%M-%S")+"."+"%03d" % (a.microsecond/1000)
    print str_time + ':' + str
    
    
def num (s):
    try:
        return int(s)
    except ValueError:
        return 0    
        
def getNews2Ru(url,total,start):
    printTime("getNews2Ru start")
    try:
        data = {}
        data['name'] = url
        data['children'] = []
        #url = 'http://news2.ru'
        #user_agent = 'Mozilla/5.0 (X11; U; Linux i686) Gecko/20071127 Firefox/2.0.0.11'
        #headers = { 'User-Agent' : user_agent }
        req = urllib2.Request(url)
        req.add_header('User-agent', 'Mozilla/5.0')
        printTime("before urlopen...")
        html = lxml.html.parse(url).getroot()
        
        #print lxml.html.tostring(html)
        #response = urllib2.urlopen(req)        
        printTime("...urlopen done")
        #print lxml.html.tostring(html)
        #print dir(html)
        
        printTime("parsing...")
        for index,news_placeholder in enumerate(html.find_class('news_placeholder')):
            id=news_placeholder.get('id').split('_')[1]
            #print 'ID',id
            votes = num(news_placeholder.xpath(".//div[@id='vote_num_"+id+"']/a/text()")[0])
            #print 'votes =',votes
            href = 'http://news2.ru/story/'+id
            title_elem=news_placeholder.xpath(".//h3[@id='news_title_"+id+"']/a/text()")[0]
            title = title_elem
            desc_elem=news_placeholder.find(".//div[@id='news_description_"+id+"']")
            desc=desc_elem.text
            img_elem = news_placeholder.find('.//img')
            #print img_elem.get('src')
            img_elem.set('src','http://news2.ru'+img_elem.get('src'))
            #print lxml.etree.tostring(img_elem)
            
            
            #comm_elem = news_placeholder.xpath(".//div[contains(@class,'comments')]")
            comm_elem = news_placeholder.xpath(".//div[@class='comments_ico']/a/text()")[0]
            comments = num(comm_elem.split()[0])
            #print [lxml.etree.tostring(e) for e in comm_elem]
            #print lxml.etree.tostring(news_placeholder).encode('utf-8')
            #print '%%%%%%%%%%%%%%%%%%%%%%' #title_div[0].text

            data['children'].append({})
            data['children'][index]['link'] = href
            #data['children'][index]['name'] = '<span>'+title+'</span>'
            #data['children'][index]['votes'] =  votes *(float(total)-i)/float(total)
            data['children'][index]['rawvotes'] =  votes #/ (float(index+start+1)*0.1 )
            data['children'][index]['description'] = desc
            data['children'][index]['img'] = lxml.etree.tostring(img_elem)
            data['children'][index]['rawcomments'] = comments
            data['children'][index]['title'] = title
            data['children'][index]['id'] = int(id)

        printTime("...done")
        return data
    except IOError as (errno):
        print "I/O error({0})".format(errno)
    finally:
        printTime("getNews2Ru end")

def getNews():
    printTime("getNews start")
    data0 = getNews2Ru('http://news2.ru/page0',50,0)
    
    data1 = getNews2Ru('http://news2.ru/page1',50,25)
    data = {}
    data['name'] = 'news2ru'

    data['children'] = data0['children']+data1['children']

    for index,elem in enumerate(data['children']):
        #elem['nvotes'] = elem['votes']#*math.log(50-index)
        #print index,elem['link']
        elem['rawindex'] = len(data['children'])-index    
    
    MAXvotes=float(max(data['children'], key=lambda k: k['rawvotes'])['rawvotes'])
    MAXcomments=float(max(data['children'], key=lambda k: k['rawcomments'])['rawcomments'])
    MAXindex=float(max(data['children'], key=lambda k: k['rawindex'])['rawindex'])
    
    data['maxVotes'] = MAXvotes
    data['maxComments'] = MAXcomments
    for index,elem in enumerate(data['children']):
        #i['size'] = '%1.3f' % (i['votes']/MAX)
        elem['votes'] = elem['rawvotes']/MAXvotes
        elem['comments'] = elem['rawcomments']/MAXcomments
        elem['socialactivity'] = elem['rawcomments']+elem['rawvotes']
        elem['popularity'] = elem['socialactivity']/(index+1)
        
        
        #elem['index'] = elem['rawindex']/MAXindex
        #elem['title'] = elem['title'] #     + '(' + repr(i['votes']) + ',' + repr(i['comments']) + ')'    
    
    #data['children'] = data['children'][1:30]
    #data['children'] = [0,0]
    #data['children'][0] = data1
    #data['children'][1] = data2 
    printTime("getNews end")    
    return json.dumps(data,indent=2)

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
    
    return json.dumps(data,indent=2)

def getMembranaPage(url):
    printTime("getMembrana start")
    try:
        data = {}
        data['name'] = url
        data['children'] = []

        req = urllib2.Request(url)
        req.add_header('User-agent', 'Mozilla/5.0')        
        response = urllib2.urlopen(req)        
        doc=response.read()
        doc=unicode(doc,'windows-1251')
        html = lxml.html.document_fromstring( doc )        
        printTime("parsing...")
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
        printTime("getNews2Ru end")

def getMembrana():
    data1 = getMembranaPage("http://www.membrana.ru/particles?page=1")
    data2 = getMembranaPage("http://www.membrana.ru/particles?page=2")
    data3 = getMembranaPage("http://www.membrana.ru/particles?page=3")
    membrana = data1['children']+data2['children']+data3['children']
    
    for index,item in enumerate(membrana):
        item['popularity'] = float(item['socialactivity'])/(index+1)
        item['socialactivity'] = item['socialactivity']
    
    minP = float(min(membrana, key=lambda k: k['popularity'])['popularity'])
    maxP = float(max(membrana, key=lambda k: k['popularity'])['popularity'])
    minS = float(min(membrana, key=lambda k: k['socialactivity'])['socialactivity'])
    maxS = float(max(membrana, key=lambda k: k['socialactivity'])['socialactivity'])
    
    for index,item in enumerate(membrana):
        item['socialactivity'] = (float(item['socialactivity'])-minS)/(maxS-minS)
    
    
    data = {}
    data['name'] = 'membrana'
    data['children'] = membrana
    #map(lambda e: e['id'], data['children']
    
    return json.dumps(data,indent=2)
    
        
if __name__ == '__main__':
    printTime("__main__ start")
    #print         getNews()
    #print         getHelp()
    print    getMembrana()    
    printTime("__main__ end")
