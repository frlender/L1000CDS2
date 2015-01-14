# convert up/dn genes of signatures into a binary sparse matrix

library(rmongodb)
library(Matrix)
library(jsonlite)

mongo <- mongo.create(host="127.0.0.1",username="readUser",
                      password="readUser",db="LINCS_L1000")

dbns = "LINCS_L1000.cpcd"

uniqGenes = fromJSON("genes.json")

vectorizeGenes <- function(genes){
  # convert genes to binary index according to uniqGenes.
  idx= uniqGenes%in%genes
}

vectorizeDiffGenes <- function(doc){
  upIdx = vectorizeGenes(doc$upGenes)
  dnIdx = vectorizeGenes(doc$dnGenes)
  c(upIdx,dnIdx)
}

sparseBatch <- function(batchList){
  batchMat <- do.call(cbind,batchList)
  Matrix(batchMat)
}

# build cursor-----------------
query = mongo.bson.from.JSON(
  '{"replicateCount":{"$gt":1},
  "pvalue":{"$lte":0.1}}');

projection = mongo.bson.from.JSON(
  '{"sig_id":1,"upGenes":1,"dnGenes":1}');


cursor <- mongo.find(mongo, ns=dbns,query=query,
                     fields=projection,
                     options=mongo.find.no.cursor.timeout)


# the sparseMat will be a vertical concatenation of up and dow sparseMats
sparseMat <- list()
batchList <- list()
i = 0
while (mongo.cursor.next(cursor)) {
  # iterate and grab the next record
  doc = mongo.bson.to.list(mongo.cursor.value(cursor))
  batchList[[doc[["sig_id"]]]] = vectorizeDiffGenes(doc)
  i = i+1
  if(i%%5000==0){
    print("begin batch sparse")
    sparseMat = c(sparseMat,list(sparseBatch(batchList)))
    batchList <- list()
  }
}

sparseMat = c(sparseMat,list(sparseBatch(batchList)))
# batchList <- list()

sparseMat <- do.call(cBind,sparseMat)
saveRDS(sparseMat,"sparseMat_cpcd.rds")