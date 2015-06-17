# -*- coding: utf-8 -*-
"""
Created on Sun Jan 25 14:58:34 2015

@author: Luke
"""

import requests
import json
url = 'http://localhost:8182/L1000CDS2/query'

# gene-set search example
data = {"upGenes":["KDM5A","EGR1","RELB"],
"dnGenes":["USP22","PHGDH","HADH"]}
config = {"aggravate":True,"searchMethod":"geneSet","share":True}
metadata = [{"key":"Tag","value":"gene-set python example"},{"key":"Cell","value":"MCF7"}]
payload = {"data":data,"config":config,"metadata":metadata}
headers = {'content-type':'application/json'}
r = requests.post(url,data=json.dumps(payload),headers=headers)
resGeneSet = r.json()

# cosine distance search example
data = {"genes":["DDIT4","HIG2","FLT1","ADM","SLC2A3","ZNF331"],"vals":[9.97,10.16,7.66,17.80,20.29,15.22]}
config = {"aggravate":False,"searchMethod":"CD","share":True}
metadata = [{"key":"Tag","value":"CD python example"},{"key":"Cell","value":"VCAP"}]
payload = {"data":data,"config":config,"metadata":metadata}
headers = {'content-type':'application/json'}
r = requests.post(url,data=json.dumps(payload),headers=headers)
resCD= r.json()

