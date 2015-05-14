var request = require('request');
var fs = require('fs');
var R = require('./query-R.js');
var mongo = require('./query-mongodb.js');

// subject to change.
// var baseURL = "http://localhost:8182/L1000CDS2/"


// var jade = require('jade');
// var indexFun = jade.compileFile('public/jade/index.jade',{pretty:true});
// fs.writeFileSync('public/index.html',indexFun({root:'',input:"",results:""}));




exports.query = function(req,res){
    // input should be processed in front-end into a unique array of 
    // uppercase gene symbols.

    res.header('Access-Control-Allow-Origin','*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');

    // pass by reference!
    var saveDoc = req.body;
    saveDoc["db-version"] = 'cpcd-v1.0';

    var callback = function(topMatches){
        // if err messenge
        if("err" in topMatches) res.send(topMatches);
        else {  
                var shareId = mongo.saveInput(saveDoc);
                var callback = function(topMeta){

                    var dataToUser = {};
                    dataToUser.shareId = shareId;
                    dataToUser.topMeta = topMeta;
                    dataToUser.searchMethod = req.body.searchMethod;
                    res.send(dataToUser);
                    mongo.incCount();
                }
                mongo.getMetas(topMatches,callback);
            }
    }
    R.query(req.body,callback)   
}

exports.multisearch = function(req,res){
    R.multi(req.body,function(topMatches){
        mongo.getMetas(topMatches,function(topMeta){
            var wstr = [];
            var tags = [];
            req.body.input.forEach(function(e){
                tags.push(e.tag)
            });
            wstr.push('id\tdrug\t'+tags.join('\t')+'\t'+'RP'+'\t'+'pval');
            topMeta.forEach(function(e){
                wstr.push(e['sig_id']+'\t'+e['pert_desc']+'\t'+e.score.join('\t'))
            });
            wstr = wstr.join('\n');
            fs.writeFile('data/multi.txt',wstr,function(err){
                if(err) throw err;
            });
            res.send(topMeta);
        });
    });
}


exports.meta = function(req,res){
    res.header('Access-Control-Allow-Origin','*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');

    var sig_id = req.param('sig_id');
    var callback = function(doc){
        res.setHeader('Content-Disposition','attachment; filename="'+sig_id+'.json"');
        res.send(JSON.stringify(doc))
    }
    mongo.getMeta(sig_id,callback);
}


exports.history = function(req,res){
    var id = req.params["id"];
    var inputCallback = function(input){
        if(!("searchMethod" in input)){
            // accomodation for user input of a previous version.
            input.searchMethod = "geneSet";
        }
        if("err" in input){
            res.send(input["err"]);
        }else{
            var RCallback = function(topMatches){
                var metaCallback = function(topMeta){
                    var dataToUser = {};
                    dataToUser.shareId = id;
                    dataToUser.topMeta = topMeta;
                    dataToUser.searchMethod = input.searchMethod;
                    res.send({input:input,results:dataToUser});
                    //res.render('index',{root:'',input:input,results:dataToUser});
                }
                mongo.getMetas(topMatches,metaCallback);
            }
            R.query(input,RCallback);
        }  
    }
    mongo.getSharedInput(id,inputCallback);
}


exports.count = function(req,res){
    mongo.getCount(res);
};


exports.signatures = function(req,res){
    res.header('Access-Control-Allow-Origin','*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    
    mongo.signaturesFromIDs(req.body,res);
};

exports.diseases = function(req,res){
    mongo.diseases(res);
}

exports.disease = function(req,res){
    id = req.query['id'];
    mongo.disease(id,res);
}