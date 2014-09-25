from bs4 import BeautifulSoup

import urllib, urllib2, cookielib, sys, requests

MAIN_PAGE = 'http://www.census2011.co.in'
SEP = '|'
HEAD_1_SET = False

def writeToFile(file_loc, data):
    with open(file_loc, "a") as myfile:
        myfile.write(data)

def getDistUrls(dist_html):
    dist_urls = {}

    parsed_html = BeautifulSoup(dist_html)
    table_data = parsed_html.find('table', {'id': 'table'})
    for row in table_data.findAll('tr'):
        col = row.findAll('td')
        if len(col) != 0:
            url = ''
            dist = ''
            state = ''
            for i in range(0, len(col)):
                if i == 1:
                    href = col[i].find('a', href=True)
                    url = href['href'].strip()
                    dist = href.text.strip()
                elif i == 2:
                    href = col[i].find('a', href=True)
                    state = href.text.strip()
                if i > 2:
                     break
            if not dist_urls.has_key(state):
                dist_urls[state] = {}
            dist_urls[state][dist] = url
        
    # Find all <a> tags having a hyperlink.
    #all_as = parsed_html.body.findAll('a', href=True)
    #for a in all_as:
    #    href = a['href']
    #    if href.startswith('/census/district/'):
    #        if href not in dist_urls:
    #            dist_urls.append(href)

    return dist_urls

def getUrlContent(url):
    content = requests.get(url)
    return content.text

def getDistData(state, dist, dist_url):
    header = 'State'+ SEP + 'District' + SEP
    record = state + SEP + dist + SEP
 
    html = getUrlContent(MAIN_PAGE + dist_url)
    parsed_html = BeautifulSoup(html)
    table_data = parsed_html.findAll('table', {'id': 'table'})

    for row in table_data[0].findAll('tr')[1:]:
        col = row.findAll('td')
        head = col[0].text.strip()
        header += head + ' (2011)' + SEP + head + ' (2001)' + SEP
        record += col[1].text.strip() + SEP + col[2].text.strip() + SEP
    
    for row in table_data[1].findAll('tr')[1:]:
        col = row.findAll('td')
        head = col[0].text.strip()
        header += head + ' (Rural)' + SEP + head + ' (Urban)' + SEP
        record += col[1].text.strip() + SEP + col[2].text.strip() + SEP

    return [header[:-1], record[:-1]]

def processAllDists(dist_urls):
    head_set = False
    states = dist_urls.keys()
    states.sort()
    for state in states:
        print 'Processing for ' + state
        state_data = dist_urls[state]
        dists = state_data.keys()
        dists.sort()
        for dist in dists:
            dist_data = getDistData(state, dist, state_data[dist])
            if not head_set:
                writeToFile('../data/out.csv', dist_data[0] + '\n')
                head_set = True
            writeToFile('../data/out.csv', dist_data[1] + '\n')

def main():
    dist_html = getUrlContent(MAIN_PAGE + '/district.php')
    dist_urls = getDistUrls(dist_html)
    processAllDists(dist_urls)
    #for dist_url in dist_urls[:1]:
    #    getDistData(dist_url)

if __name__ == '__main__':
    main()
