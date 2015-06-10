from pymongo import MongoClient
from bson.objectid import ObjectId
client = MongoClient('mongodb://readWriteUser:askQiaonan@10.91.53.62/L1000CDS2')
db = client['L1000CDS2']
coll = db['sigine-store-2']
inputLong = coll.find_one({"_id":ObjectId("5557b208ab8740e37275c62b")})
inputShort = coll.find_one({"_id":ObjectId("54cc45c1202db88e16cc5c35")})

import requests
import json
import time

localUrl = 'http://127.0.0.1:23236/custom/Sigine'
deployUrl = 'http://146.203.54.165:23236/custom/Sigine'

#short
payload = {'input':json.dumps(inputShort['data']),'method':'"geneSet"','direction':'"reverse"'}
startTime = time.time()
r = requests.post(localUrl,data=payload)
print(time.time()-startTime)

#long
payload = {'input':json.dumps(inputLong['data']),'method':'"CD"','direction':'"reverse"'}
startTime = time.time()
r = requests.post(deployUrl,data=payload)
print(time.time()-startTime)

#Test
genes = [
           ('USP18', -0.10536861617612463),
           ('H19', 0.0979803999370785),
           ('COL3A1', 0.09012118037674563),
           ('MYL9', 0.09001543082469686),
           ('CTGF', 0.08922812355076926),
           ('TAGLN', 0.0823789311253236)
       ]

data = {'genes':[item[0] for item in genes],'vals':[item[1] for item in genes]}
# with open('testData1.json','w') as tf:
#     json.dump(data,tf)
payload = {'input':json.dumps(data),'method':'"CD"','direction':'"reverse"'}
startTime = time.time()
r = requests.post(deployUrl,data=payload)
print(time.time()-startTime)