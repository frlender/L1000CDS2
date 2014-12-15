library(rmongodb)
library(pracma)
library(Matrix)
mongo <- mongo.create(host="10.91.53.249")
# mongo
dbns = "LINCS_L1000.cpc2014"

# sparseBatch function ----------------------------------------------------
full2uniq <- readRDS("full2uniq.rds")
# full2uniq <- as.matrix(full2uniq)
setSmallZero <- function(mat,keepCount){
  mat2 <- mat^2
  idx <- apply(mat2,2,
               function(x){order(x,decreasing=TRUE)})
  idx <- idx[1:keepCount,]
  
  filterMat = matrix(0,dim(mat)[1],dim(mat)[2])
  colnames(filterMat) <- colnames(mat)
  
  
  count = 0
  for(name in colnames(mat)){
    takeIdx <- idx[,name]
    filterMat[takeIdx,name] <- mat[takeIdx,name]
    count = count + 1
    if(count%%100==0){
      print(count)
    }
  }
 
# sparse filterMat   
  Matrix(filterMat)
}

sparseBatch <- function(batchList){
  batchList <- do.call(cbind,batchList)
  batchList <- t(full2uniq)%*%batchList
  batchList <- as.matrix(batchList)
# normalize to unit vector:
  batchList.norm <- sqrt(colSums(batchList^2))
  batchList.norm <- repmat(batchList.norm,
                           dim(batchList)[1],1)
  batchList <- batchList/batchList.norm
  keepCount <- ceiling(dim(batchList)[1]/10)
  
  batchList <- setSmallZero(batchList,keepCount)
}

# build cursor ------------------------------------------------------------
query = mongo.bson.from.JSON(
  '{"replicateCount":{"$gt":1},
  "pvalue":{"$lte":0.05},
  "pert_type":"trt_sh"}');

projection = mongo.bson.from.JSON(
  '{"sig_id":1,"chdirFull":1}');


cursor <- mongo.find(mongo, ns=dbns,query=query,
                     fields=projection,
                     options=mongo.find.no.cursor.timeout)


sparseMat <- list()
batchList <- list()
i = 0
while (mongo.cursor.next(cursor)) {
  # iterate and grab the next record
  doc = mongo.bson.to.list(mongo.cursor.value(cursor))
  batchList[[doc[["sig_id"]]]] = unlist(doc$chdir)
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
saveRDS(sparseMat,"sparseMat_sh.rds")

#  ------------------------------------------------------------------------

