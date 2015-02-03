# -*- coding: utf-8 -*-
"""
Created on Mon Feb  2 16:30:43 2015

@author: Luke
"""
# add data generation center with each.

import json

with open('arr.json','r') as af:
    x = json.loads(af.read())
    
from pymongo import MongoClient
client = MongoClient()
db = client["DSGC-data"]
coll = db["milestones"]

for elem in x:
    coll.save(elem)