__author__ = 'Luke'

idMap = {}
with open(r'C:\Users\Luke\Documents\nodejs_server\Sigine\sigine\data\lincs_compounds_meta.csv','r') as of:
    for line in of:
        words = line.strip('\r\n').split(',')
        idMap[words[0]] = {}
        idMap[words[0]]['pubchem'] = False if words[1]=='\\N' else words[1]
        idMap[words[0]]['drugbank'] = False if words[2]=='\\N' else words[2]
import json
with open('pertIDMap.json','w') as pf:
    pf.write(json.dumps(idMap))

dbi = [idMap[item]['drugbank'] for item in idMap.keys() if idMap[item]['drugbank']]