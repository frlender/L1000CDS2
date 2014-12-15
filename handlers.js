var request = require('request');
var us = require('underscore');
var fs = require('fs');
var mongoose = require('mongoose');

var genes = JSON.parse(fs.readFileSync('data/genes.json'));
var genes2idx = {};
genes.forEach(function(gene,i){
	// R uses one-based index.
	genes2idx[gene] = i+1;
});


mongoose.connect('10.91.53.207','LINCS_L1000');
// mongoose.connect('localhost','LINCS_L1000');
var Schema = mongoose.Schema({"pert_desc":String,"cell_id":String,
	"pert_dose":String,"pert_dose_unit":String,"pert_time":String,
	"pert_time_unit":String})
var Expm = mongoose.model('cpc2014',Schema);


//get meta information by sig_id and send results to client.
var getMeta = function(topExpms,res){
	var map = {}
	topExpms["expms"].forEach(function(e,i) {
		map[e] = i;
	});

	var query = Expm.find({sig_id:{$in:topExpms["expms"]}})
		.select('-_id sig_id pert_type pert_desc cell_id pert_dose pert_dose_unit pert_time pert_time_unit').lean();
	
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
			topMeta[idx].posPercent = topExpms["posPercent"][idx];
		});
		console.log('topMeta',topMeta.slice(0,3))
		res.send(topMeta.slice(0,12));
	});
}

exports.query = function(req,res){
	// input should be processed in front-end into a unique array of 
	// uppercase gene symbols.
	var input = req.body.input;
	var idx = [];
	input.forEach(function(gene,i){
		var eachIdx = genes2idx[gene];
		if(eachIdx) idx.push(eachIdx);
	});

	request.post('http://127.0.0.1:12601/custom/test2', 
		{form:JSON.stringify(idx)},
		function(err,results){
			if(err) throw err;
			var topExpms = JSON.parse(results.body);
			// res.send(topExpms);
			getMeta(topExpms["cp"],res);
	});


}


