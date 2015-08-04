# -*- coding: utf-8 -*-
"""
Created on Wed Jul 29 11:10:38 2015

@author: Luke
"""
import requests
import json
url = 'http://amp.pharm.mssm.edu/L1000CDS2/query'

def upperGenes(genes):
    # The app uses uppercase gene symbols. So it is crucial to perform upperGenes() step.
    return [gene.upper() for gene in genes]

# gene-set search example
data = {"upGenes":["KDM5A","EGR1","RELB"],
"dnGenes":["USP22","PHGDH","HADH"]}
data['upGenes'] = upperGenes(data['upGenes'])
data['dnGenes'] = upperGenes(data['dnGenes'])
config = {"aggravate":True,"searchMethod":"geneSet","share":True,"combination":True}
metadata = [{"key":"Tag","value":"gene-set python example"},{"key":"Cell","value":"MCF7"}]
payload = {"data":data,"config":config,"meta":metadata}
headers = {'content-type':'application/json'}
r = requests.post(url,data=json.dumps(payload),headers=headers)
resGeneSet = r.json()

# cosine distance search example
data = {"genes":["DDIT4","HIG2","FLT1","ADM","SLC2A3","ZNF331"],"vals":[9.97,10.16,7.66,17.80,20.29,15.22]}
data['genes'] = upperGenes(data['genes'])
config = {"aggravate":False,"searchMethod":"CD","share":True,'combination':True}
metadata = [{"key":"Tag","value":"CD python example"},{"key":"Cell","value":"VCAP"}]
payload = {"data":data,"config":config,"meta":metadata}
headers = {'content-type':'application/json'}
r = requests.post(url,data=json.dumps(payload),headers=headers)
resCD= r.json()

url = 'http://locahost/L1000CDS2/query'
with open(r'C:\Users\Luke\Documents\nodejs_server\Sigine\testLibraries\post_payload.txt') as pf:
    payload = json.load(pf)
headers = {'content-type':'application/json'}
r = requests.post(url,data=json.dumps(payload),headers=headers)
resCD = r.json()