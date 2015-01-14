# the working directory should be set as the parent folder

library(rmongodb)
library(Matrix)
library(jsonlite)

mongo <- mongo.create(host="127.0.0.1",username="readUser",
                      password="readUser",db="LINCS_L1000")

dbns = "LINCS_L1000.cpcd"

uniqGenes <- fromJSON("genes.json")
sparseMat <- readRDS("sparseMat_cpcd.rds")
sig_ids <- colnames(sparseMat)

expmCount <- dim(sparseMat)[2]

samples <- sample(1:expmCount,10)

projection = mongo.bson.from.JSON(
  '{"sig_id":1,"upGenes":1,"dnGenes":1}');

for(i in samples){
  sig_id <- sig_ids[i]
  vec <- sparseMat[,i]
  vecUp <- vec[1:length(uniqGenes)]
  vecDn <- vec[(length(uniqGenes)+1):length(vec)]
  vecUpGenes <- uniqGenes[vecUp]
  vecDnGenes <- uniqGenes[vecDn]
  query = mongo.bson.from.JSON(
    sprintf('{"sig_id":"%s"}',sig_id));
  doc <- mongo.findOne(mongo, ns=dbns,query=query,
                       fields=projection)
  doc <- mongo.bson.to.list(doc)
  #  -666 is not included in the uniqGenes
  stopifnot(length(intersect(vecUpGenes,doc$upGenes))-
              length(vecUpGenes) <= 1)
  stopifnot(length(intersect(vecDnGenes,doc$dnGenes))-
              length(vecDnGenes) <= 1)
}

print("succeed")