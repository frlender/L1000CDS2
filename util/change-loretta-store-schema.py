__author__ = 'Luke'
from pymongo import MongoClient
client = MongoClient('mongodb://readWriteUser:askQiaonan@loretta/L1000CDS2')
collStore = client['L1000CDS2']['sigine-store']
collStore2 = client['L1000CDS2']['sigine-store-2']

for doc in collStore.find():
    update = {"_id":doc['_id'],
              "config":{'db-version':'cpcd-v1.0',
                        "aggravate":doc["aggravate"]},
              "data":{},
              "meta":{}}
    if "searchMethod" not in doc:
        update['config']['searchMethod'] = "geneSet"
        update['data']['upGenes'] = doc['upGenes']
        update['data']['dnGenes'] = doc['dnGenes']
    elif "input" in doc:
        if "searchMethod" == "geneSet":
            update['data']['upGenes'] = doc['upGenes']
            update['data']['dnGenes'] = doc['dnGenes']
        elif "searchMethod" == "CD":
            update['data']['genes'] = doc['input']['genes']
            update['data']['vals'] = doc['input']['vals']
        else:
            print('searchMethod is not right')
            break
        update['_id'] = doc['_id']
        collStore2.save(update)
    elif "upGenes" in doc and "dnGenes" in doc:
        update = {"config":{},"data":{},"meta":{}}
        update['data']['upGenes'] = doc['upGenes']
        update['data']['dnGenes'] = doc['dnGenes']
        if "searchMethod" not in doc:
            update['config']['searchMethod'] = "geneSet"
        update['config']['aggravate'] = doc['aggravate']
        update['_id'] = doc['_id']
        collStore2.save(update)
    else:
        break