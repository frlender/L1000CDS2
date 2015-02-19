# -*- coding: utf-8 -*-
"""
Created on Sun Jan 25 14:58:34 2015

@author: Luke
"""

import requests
import json

url = 'http://amp.pharm.mssm.edu/lssr/query'
payload = {"upGenes":["KDM5A","EGR1","RELB"],
"dnGenes":["USP22","PHGDH","HADH"],"aggravate":True}

headers = {'content-type':'application/json'}

r = requests.post(url,data=json.dumps(payload),headers=headers)

print(r.json)


url = 'http://10.91.53.62:8182/L1000CDS2/signatures'
payload = ["CPC001_HA1E_24H:BRD-A07875874:10.0","CPC001_HA1E_24H:BRD-A43974499:10.0"]
headers = {'content-type':'application/json'}
r = requests.post(url,data=json.dumps(payload),headers=headers)
cc = r.json
