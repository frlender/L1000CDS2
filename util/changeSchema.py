# -*- coding: utf-8 -*-
"""
Created on Tue May 19 14:47:44 2015

@author: Luke
"""

from pymongo import MongoClient
client = MongoClient('mongodb://readWriteUser:askQiaonan@localhost/L1000CDS2')
coll = client['L1000CDS2']['sigine-store-old']
newColl = client['L1000CDS2']['sigine-store']

for doc in coll.find():
    if "upGenes" in doc and "dnGenes" in doc:
        update = {"config":{},"data":{},"meta":{}}
        update['data']['upGenes'] = doc['upGenes']
        update['data']['dnGenes'] = doc['dnGenes']
        if "searchMethod" not in doc:
            update['config']['searchMethod'] = "geneSet"
        update['config']['aggravate'] = doc['aggravate']
        update['_id'] = doc['_id']
        newColl.save(update)
    elif "input" in doc:
        update = {"config":{},"data":{},"meta":{}}
        if "searchMethod" not in doc:
            update['config']['searchMethod'] = "geneSet"
        update['data']['upGenes'] = doc['input']['upGenes']
        update['data']['dnGenes'] = doc['input']['dnGenes']
        if "config" in doc:
            update['config'] = doc['config']
        else:
            update['config']['aggravate'] = doc['aggravate']
        update['_id'] = doc['_id']
        newColl.save(update)
    else:
        break
                