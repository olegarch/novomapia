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

def printTime(str):
    #pass
    #return
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

    data['len'] = len(data['children'])
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
        elem['index'] = elem['rawindex']/MAXindex
        #elem['title'] = elem['title'] #     + '(' + repr(i['votes']) + ',' + repr(i['comments']) + ')'    

    #data['children'] = [0,0]
    #data['children'][0] = data1
    #data['children'][1] = data2 
    printTime("getNews end")    
    return json.dumps(data,indent=2)
    
if __name__ == '__main__':
    printTime("__main__ start")
    print     getNews()
    printTime("__main__ end")
