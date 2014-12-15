require(Rook)
library(Matrix)
library(jsonlite)
pathx = 'D:\\Qiaonan Working\\data\\searchEngine\\sparseMat.rds'
sparseMat <- readRDS(pathx)
sparseMat2 <- sparseMat^2
colSumsAvg <- mean(colSums(sparseMat2))
keepCount <- 1272
sig.ids <- colnames(sparseMat)

s <- Rhttpd$new()
s$start(listen='127.0.0.1',port=19356)

g.transform <- function(param){
  scores <- colSums(sparseMat2[param,])
  topIdx <- order(scores,decreasing=TRUE)[1:50]
  topScores <- scores[topIdx]
  topMat <- as.matrix(sparseMat[param,topIdx])
  pos <- topMat > 0
  topMatPos <- pos*topMat
  posPercent <- colSums(topMatPos^2)/topScores-0.5
  
  normalizedAvg <- length(param)/1272*colSumsAvg
  res <- list()
  res[["expms"]] <- sig.ids[topIdx]
  res[["scores"]] <- topScores/normalizedAvg
  res[["posPercent"]] <- posPercent
  toJSON(res)
#   toString(res)
}

# # test
# param <- sample(1:12716,200)
# ptm <- proc.time()
# k <- g.transform(param)
# proc.time()-ptm
parseParam <- function(param){
  fromJSON(substr(param,2,nchar(param)))
}

my.app <- function(env){
  ## Start with a table and allow the user to upload a CSV-file
  req <- Request$new(env)
  res <- Response$new()
  res$header("Access-Control-Allow-Origin","*")
  res$header("Access-Control-Allow-Methods","GET,PUT,POST,DELETE")
  
  print('good')
  print(req$POST())
  print(parseParam(req$POST()[[1]]))
  
  param <- parseParam(req$POST()[[1]])
  ptm <- proc.time()
  res$write(g.transform(param))
  print(proc.time()-ptm)
  res$finish()   
}

s$add(app=my.app, name='test2')
## Open a browser window and display the web app
s$browse('test2')