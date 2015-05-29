__author__ = 'Luke'
from pymongo import MongoClient
client = MongoClient('mongodb://readWriteUser:askQiaonan@loretta/L1000CDS2')
collStore = client['L1000CDS2']['sigine-store']
collStore2 = client['L1000CDS2']['sigine-store-2']

for doc in collStore.find():
    update = {"_id":doc['_id'],
              "config":{'db-version':'cpcd-v1.0',
                        "aggravate":doc["aggravate"],
                        "share":False},
              "data":{},
              "meta":[]}
    if "searchMethod" not in doc:
        update['config']['searchMethod'] = "geneSet"
        update['data']['upGenes'] = doc['upGenes']
        update['data']['dnGenes'] = doc['dnGenes']
    elif "input" in doc:
        if doc["searchMethod"] == "geneSet":
            update['config']['searchMethod'] = "geneSet"
            update['data']['upGenes'] = doc['upGenes']
            update['data']['dnGenes'] = doc['dnGenes']
        elif doc["searchMethod"] == "CD":
            update['config']['searchMethod'] = "CD"
            update['data']['genes'] = doc['input']['genes']
            update['data']['vals'] = doc['input']['vals']
        else:
            print('searchMethod is not right')
            break
    else:
        print('Exceptions')
        break
    collStore2.save(update)


collShare = client['L1000CDS2']['sigine-share']
collShare2 = client['L1000CDS2']['sigine-share-2']
for doc in collShare.find():
    collShare2.save(doc)
