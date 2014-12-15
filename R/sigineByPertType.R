require(Rook)
library(Matrix)
library(jsonlite)
cpRds = 'D:\\Qiaonan Working\\data\\searchEngine\\sparseMat_cp.rds'
oeRds = 'D:\\Qiaonan Working\\data\\searchEngine\\sparseMat_oe.rds'
shRds = 'D:\\Qiaonan Working\\data\\searchEngine\\sparseMat_sh.rds'

cpSparseMat <- readRDS(cpRds)
oeSparseMat <- readRDS(oeRds)
shSparseMat <- readRDS(shRds)

cpIdx = seq(1,dim(cpSparseMat)[2])
oeIdx = seq(dim(cpSparseMat)[2]+1,
            dim(cpSparseMat)[2]+dim(oeSparseMat)[2])
shIdx = seq(dim(cpSparseMat)[2]+dim(oeSparseMat)[2]+1,
            dim(cpSparseMat)[2]+dim(oeSparseMat)[2]+dim(shSparseMat)[2])
sparseMat <- cBind(cpSparseMat,oeSparseMat,shSparseMat)
sparseMat2 <- sparseMat^2
sig.ids <- colnames(sparseMat)

s <- Rhttpd$new()
s$start(listen='127.0.0.1')


sortTop <- function(param,scores,colIdx){
  topIdx <- order(scores[colIdx],decreasing=TRUE)[1:20]
  topScores <- scores[colIdx][topIdx]
  topMat <- as.matrix(sparseMat[param,colIdx][,topIdx])
  pos <- topMat > 0
  topMatPos <- pos*topMat
  posPercent <- colSums(topMatPos^2)/topScores
  res <- list()
  res[["expms"]] <- sig.ids[colIdx][topIdx]
  res[["scores"]] <- topScores
  res[["posPercent"]] <- posPercent
  res
}


g.transform <- function(param){
  scores <- colSums(sparseMat2[param,])
  cp <- sortTop(param,scores,cpIdx)
  oe <- sortTop(param,scores,oeIdx)
  sh <- sortTop(param,scores,shIdx)
  res <- list()
  res[["cp"]] = cp
  res[["oe"]] = oe
  res[["sh"]] = sh
  toJSON(res)
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