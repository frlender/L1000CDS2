var request = require('request');
var us = require('underscore');
var fs = require('fs');
var mongo = require('./query-mongodb.js');

var jade = require('jade');
var indexFun = jade.compileFile('public/jade/index.jade',{pretty:true});
fs.writeFileSync('public/index.html',indexFun({root:'',input:""}));


// Set the headers
var headers = {
    'User-Agent':       'Super Agent/0.0.1',
    'Content-Type':     'application/x-www-form-urlencoded'
}

exports.query = function(req,res){
    // input should be processed in front-end into a unique array of 
    // uppercase gene symbols.

    res.header('Access-Control-Allow-Origin','*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');

    // pass by reference!
    var saveDoc = req.body;
    saveDoc["db-version"] = 'cpcd-v1.0';
    var shareId = mongo.saveInput(saveDoc);


    if(req.body.aggravate){
        var upGenes = JSON.stringify(req.body.upGenes),
            dnGenes = JSON.stringify(req.body.dnGenes);
    }else{
        // reverse search
        var upGenes = JSON.stringify(req.body.dnGenes),
            dnGenes = JSON.stringify(req.body.upGenes);
    }
    
    var options = {
        url: 'http://127.0.0.1:23239/custom/Sigine',
        method: 'POST',
        headers: headers,
        form: {'upGenes': upGenes,
            'dnGenes':dnGenes}
    }


    // Start the request
    request(options, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            // Print out the response body
            // console.log(body,typeof(body))
            // res.send(body);
            // var enrichRes = JSON.parse(body);
            var topMatches = JSON.parse(body);

            // if err send err messenge
            if("err" in topMatches) res.send(topMatches);
            else {
                var callback = function(topMeta){
                    var dataToUser = {};
                    dataToUser.shareId = shareId;
                    dataToUser.topMeta = topMeta;
                    res.send(dataToUser);
                }
                mongo.getMetas(topMatches,callback);
            }
        }
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


exports.geo2me = function(req,res){
    res.header('Access-Control-Allow-Origin','*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');

    res.render('index',{root:'', input:req.body});

}

// exports.index = function(req,res){
//     res.render('index',{root:'', input:""});
// }

