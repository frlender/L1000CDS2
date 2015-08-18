# -*- coding: utf-8 -*-
"""
Created on Tue Aug 18 15:54:53 2015

@author: Luke
"""

%load_ext autoreload
%autoreload 2
import os
os.chdir(r'C:\Users\Luke\Documents\nodejs_server\Sigine\sigine\public\data')

import json
with open('22ligandsAvgLmCD.json','r') as lf:
    res = json.load(lf)


from pymongo import MongoClient
client = MongoClient('10.91.53.225', 27017)
db = client['L1000CDS2']
coll = db['ligands']

for ligand in res['avgLmCDs']:
    doc = {"term":ligand["pert"],
           "genes":res['genes'],
            "vals":ligand["avg"]}
    coll.save(doc)