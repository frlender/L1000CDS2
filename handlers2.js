var request = require('request');
var fs = require('fs');
var R = require('./query-R.js');
var mongo = require('./query-mongodb.js');
var util = require('./util.js');
var CronJob = require('cron').CronJob;


exports.query = function(req,res){
    // input should be processed in front-end into a unique array of
    // uppercase gene symbols.

    // pass by reference!
    // db-version now is a required field of req.body
    if(req.body.config['db-version']=="latest"){
        req.body.config['db-version'] = 'cpcd-gse70138-v1.0';
    }
    var saveDoc = req.body;

    saveDoc["user"].ip = req.ip;

    var callback = function(err,topMatches){
        // if err messenge
        // debugger;
        if(err) res.send({err:err.message});
        else {
                var shareId = mongo.saveInput(saveDoc);
                var callback = function(topMeta){

                    var dataToUser = {};
                    dataToUser.shareId = shareId;
                    topMeta.forEach(function(e){
                        util.addExternalPertIDs(e);
                    });
                    dataToUser.topMeta = topMeta
                    if("uniqInput" in topMatches){
                        dataToUser.uniqInput = topMatches.uniqInput;
                    }
                    if('combinations' in topMatches){
                        dataToUser.combinations = topMatches.combinations;
                    }
                    res.send(dataToUser);
                    mongo.incCount();
                }
                mongo.getMetas(topMatches,callback);
            }
    }
    var valid = util.validateInput(req.body)
    if('err' in valid){
      res.send(valid);
      return;
    }else
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

    var sig_id = req.query['sig_id'];
    var callback = function(doc){
        res.setHeader('Content-Disposition','attachment; filename="'+sig_id+'.json"');
        res.send(JSON.stringify(doc))
    }
    mongo.getMeta(sig_id,callback);
}


exports.history = function(req,res){
    var id = req.params["id"];
    var inputCallback = function(input){
        if("err" in input){
            res.send(input);
        }else{
            if(!("user" in input)){
                input.user = {};
                input.user.endpoint = 'API';
            }else if(!('endpoint' in input.user)){
                input.user.endpoint = 'API';
            }
            var RCallback = function(err,topMatches){
                if(err) res.send({err:err.message})
                else{
                    var metaCallback = function(topMeta){
                        var dataToUser = {};
                        dataToUser.shareId = id;
                        topMeta.forEach(function(e){
                            util.addExternalPertIDs(e);
                        });
                        dataToUser.topMeta = topMeta
                        if("uniqInput" in topMatches){
                            dataToUser.uniqInput = topMatches.uniqInput;
                        }
                        if('combinations' in topMatches){
                            dataToUser.combinations = topMatches.combinations;
                        }
                        delete input.user;
                        res.send({input:input,results:dataToUser});
                        //res.render('index',{root:'',input:input,results:dataToUser});
                    }
                    mongo.getMetas(topMatches,metaCallback);
                }
            }
            R.query(input,RCallback);
        }
    }
    mongo.getSharedInput(id,inputCallback);
}


exports.count = function(req,res){
    res.header('Access-Control-Allow-Origin','*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    mongo.getCount(function(count){
        res.send(count+"");
    });
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

exports.ligands = function(req,res){
    mongo.ligands(res);
}

exports.ligand = function(req,res){
    id = req.query['id'];
    mongo.ligand(id,res);
}

exports.drugEnrich = function(req,res){
    R.drugEnrich(JSON.stringify(req.body),function(enrichRes){
        // enrichRes.data
        res.send(enrichRes.data.struct);
    });
}

exports.ccleCells = function(req,res){
    mongo.ccleCells(res);
}

exports.ccleCell = function(req,res){
    id = req.query['id'];
    mongo.ccleCell(id,res);
}


// for calendar view of the count
var countByDate = [];
var countTotalYesterday;
mongo.getTimeBracket(function(countByDateCurrent){
    debugger;
    var todayDate = new Date();
    var last = countByDateCurrent[countByDateCurrent.length-1];
    if(last[0]==(todayDate.getYear()+1900) && last[1] == (todayDate.getMonth()+1) &&
        last[2] == todayDate.getDate()){
        debugger;
        countByDate = countByDateCurrent.slice(0,countByDateCurrent.length-1);
        var today = last;
        mongo.getCount(function(count){
            countTotalYesterday = count-today[3];
        });
    }else{
        debugger;
        countByDate = countByDateCurrent;
         mongo.getCount(function(count){
            countTotalYesterday = count;
        });
    }
   
    new CronJob('51 59 23 * * *',function(){
        console.log('start cron');
        console.log(new Date());
        mongo.getCount(function(count){
            console.log(countTotalYesterday,countByDate[countByDate.length-1]);
            var today = new Date();
            countByDate.push([today.getYear()+1900,today.getMonth()+1,
                today.getDate(),count-countTotalYesterday]);
            countTotalYesterday = count;
            console.log(countTotalYesterday,countByDate[countByDate.length-1]);
            console.log('end cron')
        });
    },null,true);
});

exports.countByDate = function(req,res){
    res.header('Access-Control-Allow-Origin','*');
    res.header('Access-Control-Allow-Methods', 'GET');
    var sentCount = JSON.parse(JSON.stringify(countByDate));
    var today = new Date();
    mongo.getCount(function(count){
        var todayCount = count-countTotalYesterday;
        sentCount.push([today.getYear()+1900,today.getMonth()+1,
            today.getDate(),todayCount]);
        res.send(sentCount);
    });
}

exports.predictTarget = function(req,res){
    console.log(req.body)
    R.predictTarget(req.body,function(topMatches){
        mongo.getMicrotaskSignatures(topMatches,function(topMeta){
            res.send(topMeta);
        });
    });
}