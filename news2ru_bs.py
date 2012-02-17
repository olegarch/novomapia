# -*- coding: utf-8 -*-

import urllib
import urllib2
import json
import random
import re
import math
from BeautifulSoup import BeautifulSoup
from datetime import datetime
import time

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
        response = urllib2.urlopen(req)        
        printTime("...urlopen done")
        #response = urllib.urlopen('http://news2.ru')
        #print repr(response)
        html = response.read()
        #print repr(html)
        soup = BeautifulSoup(html)
        #print soup.prettify()
        
        news_placeholders = soup.findAll('div','news_placeholder')
        for index, news_placeholder in enumerate(news_placeholders):
            #if(i>5): break
            id = news_placeholder['id'].split('_')[1]
            #vote_num_div = news_placeholder.find('div',attrs={'id' : re.compile("^vote_num_")})
            vote_num_div = news_placeholder.find('div',attrs={'id' : 'vote_num_'+id })
            href = 'http://news2.ru'+vote_num_div.a['href']
            votes = num(vote_num_div.a.text)
            title_div = news_placeholder.find(attrs={'id' : 'news_title_'+id })
            title = title_div.a.text
            #print title.encode('utf-8')
            desc_div = news_placeholder.find('div',attrs={'id' : 'news_description_'+id })
            desc = desc_div.text
            img_elem = news_placeholder.find('img')
            img = unicode(img_elem)
            #print img.encode('utf-8')
            img = re.sub(r'src="(.*generated.(jpg|png))" ',r'src="http://news2.ru\1" style="float: left" ',img)
            #print img.encode('utf-8')
            #print title.encode('utf-8')            
            #print vote_num_div.a['href'] + ': ' +vote_num_div.a.text
            
            comm_div = news_placeholder.find('div',attrs={'class' : re.compile('^.*comments.*ico$') })
            #print unicode(news_placeholder).encode('utf-8')
            #print unicode(comm_div).encode('utf-8')
            #print unicode(comm_div.a.text).encode('utf-8')
            comments = num(comm_div.a.text.split()[0])
                        
            data['children'].append({})
            data['children'][index]['link'] = href
            #data['children'][index]['name'] = '<span>'+title+'</span>'
            #data['children'][index]['votes'] =  votes *(float(total)-i)/float(total)
            data['children'][index]['rawvotes'] =  votes #/ (float(index+start+1)*0.1 )
            data['children'][index]['description'] = desc
            data['children'][index]['img'] = img
            data['children'][index]['rawcomments'] = comments
            data['children'][index]['title'] = title
            data['children'][index]['id'] = int(id)
        

        
        #m2= map(lambda e: {'size':e['size'] },data['children'])
        #print repr(m2)
        
        
        #return json.dumps(data,indent=2)
        return data
        
        data = {}
        data['name'] = 'news2ru'
        data['children'] = []
        for i in range(0,100):
            data['children'].append({})
            data['children'][i]['name'] = '<a href="#">'+repr(i)+'</a>'
            data['children'][i]['size'] = random.randint(1,100)
            
        return json.dumps(data,indent=2)
    except IOError as (errno):
        print "I/O error({0})".format(errno)
    finally:
        printTime("getNews2Ru end")

def getNews():
    printTime("getNews start")
    data0 = getNews2Ru('http://news2.ru/page0',50,0)
    #data1 = getNews2Ru('http://news2.ru/page1',50,25)
    data = {}
    data['name'] = 'news2ru'

    data['children'] = data0['children']#+data1['children']

    for index,elem in enumerate(data['children']):
        #elem['nvotes'] = elem['votes']#*math.log(50-index)
        #print index,elem['link']
        elem['rawindex'] = len(data['children'])-index    
    
    MAXvotes=float(max(data['children'], key=lambda k: k['rawvotes'])['rawvotes'])
    MAXcomments=float(max(data['children'], key=lambda k: k['rawcomments'])['rawcomments'])
    MAXindex=float(max(data['children'], key=lambda k: k['rawindex'])['rawindex'])
    
    data['maxVotes'] = MAXvotes
    data['maxComments'] = MAXcomments
    #print MAX, MAXcom
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
    print getNews()
    printTime("__main__ end")
