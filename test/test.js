var test = require('nodeunit');
var _ = require('underscore');
var fs = require('fs');

var R = require('../query-R.js');
var hdl = require('../handlers2.js');

// fs.readFile('test/testData/sig_ids.json',function(err,buffer) {
// 		console.log(buffer);
// });

exports.testStructure = function(test){
	fs.readFile('test/testData/sig_ids.json',function(err,buffer) {
		var sig_ids = JSON.parse(buffer.toString());
		var pert_ids = sig_ids.map(function(sig_id){
			return sig_id.split(':')[1];
		});
		R.drugEnrich(JSON.stringify(pert_ids),function(enrichRes){
			var output = enrichRes.data.struct;
			// console.log(output);
			test.ok(output.length==3);
			test.ok(output[0].overlapCount[0]==21);
			test.done();
		});
	})
}