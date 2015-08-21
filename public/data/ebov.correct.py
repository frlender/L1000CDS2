# -*- coding: utf-8 -*-
"""
Created on Fri Aug 21 11:10:28 2015

@author: Luke
"""

import os
os.chdir(r'C:\Users\Luke\Documents\nodejs_server\Sigine\sigine\public\data')

import json
with open('ebovs.json','r') as ef:
    ebovs = json.load(ef)
    
for key in ebovs:
    ebovs[key]['vals'] = [-val for val in ebovs[key]['vals']]

with open('ebovs.corrected.json','w') as ef:
    json.dump(ebovs,ef)