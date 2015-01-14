# set the folder of this script as working directory.

library(Rook)
library(Matrix)
library(jsonlite)



uniqGenes = fromJSON("genes.json")
sparseMat <- readRDS("sparseMat_cpcd.rds")
sig_ids <- colnames(sparseMat)


topMatch <- function(upGenes,dnGenes){
  # check if idx is made of all FALSE in nodejs.
  # this function suppose that sum(idx) >= 1
  
  # convert genes to binary index according to uniqGenes.
  upIdx <- uniqGenes%in%upGenes
  dnIdx <- uniqGenes%in%dnGenes
  idx <- c(upIdx,dnIdx)
  indexedMat <- sparseMat[idx,]
  overlaps <- colSums(indexedMat)
  topIdx <- order(overlaps,decreasing=TRUE)[1:50]
  res <- list()
  res$sig_ids <- sig_ids[topIdx]
  res$scores <- overlaps[topIdx]/sum(idx)
  toJSON(res)
}


# server start ------------------------------------------------------------

s <- Rhttpd$new()
s$start(listen='127.0.0.1')


my.app <- function(env){

  req <- Request$new(env)
  res <- Response$new()
  res$header("Access-Control-Allow-Origin","*")
  res$header("Access-Control-Allow-Methods","GET,PUT,POST,DELETE")
  
  print('good')
  upGenes <- fromJSON(req$POST()$upGenes)
  dnGenes <- fromJSON(req$POST()$dnGenes)
  
  print(upGenes)

  ptm <- proc.time()
  res$write(topMatch(upGenes,dnGenes))
  print(proc.time()-ptm)
  res$finish()
}

s$add(app=my.app, name='Sigine')
## Open a browser window and display the web app
s$browse('Sigine')
