var request = require('request');
var mongoose = require('mongoose');
var us = require('underscore');


mongoose.connect('mongodb://readUser:readUser@localhost/LINCS_L1000');
var Schema = mongoose.Schema({"pert_desc":String,"cell_id":String,
    "pert_dose":String,"pert_dose_unit":String,"pert_time":String,
    "pert_time_unit":String},{collection:"cpcd"})
var Expm = mongoose.model('Expm',Schema);

//get meta information by sig_id and send results to client.
var getMetas = function(topExpms,res){
    // topExpms structure:
    // topExpms -- [sig_ids]
    //          -- [scores]
    
    // map is necessary to sort the query results in the order of topExpms
    var map = {};
    topExpms["sig_ids"].forEach(function(e,i) {
        map[e] = i;
    });

    var query = Expm.find({sig_id:{$in:topExpms["sig_ids"]}})
        .select('-_id sig_id pert_id pert_type pert_desc cell_id pert_dose pert_dose_unit pert_time pert_time_unit').lean();
    
    console.log(map);
    query.exec(function(err,queryRes){
        if(err) throw err;
        console.log(queryRes.slice(0,2),'aaaa');
        var topMeta = [];
        queryRes.forEach(function(e){
            var idx = map[e["sig_id"]];
            console.log(idx);
            topMeta[idx] = e;
            topMeta[idx].score = topExpms["scores"][idx];
        });
        console.log('topMeta',topMeta.slice(0,3))
        res.send(topMeta.slice(0,36));
    });
}


// Set the headers
var headers = {
    'User-Agent':       'Super Agent/0.0.1',
    'Content-Type':     'application/x-www-form-urlencoded'
}

exports.query = function(req,res){
    // input should be processed in front-end into a unique array of 
    // uppercase gene symbols.

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
            console.log(body,typeof(body))
            // res.send(body);
            // var enrichRes = JSON.parse(body);
            
            getMetas(JSON.parse(body),res);
        }
    });
}


exports.meta = function(req,res){
    var sig_id = req.param('sig_id');
    var query = Expm.findOne({sig_id:sig_id}).lean().exec(function(err,doc){
        if(err) throw err;
        res.setHeader('Content-Disposition','attachment; filename="'+sig_id+'.json"');
        res.send(JSON.stringify(doc))
    });
}

