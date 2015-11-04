var test = require('nodeunit');
var _ = require('underscore');
var fs = require('fs');

var R = require('../query-R.js');
var hdl = require('../handlers2.js');
var util = require('../util.js');


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

exports.testSchema = {
	testVoid:function(test){
		var input = undefined;
		var valid = util.validateInput(input);
		test.ok(valid.err == "Input is not an object.");
		test.done();
	},
	testConfig:function(test){
		var input = {};
		var valid = util.validateInput(input);
		test.ok(valid.err == "No search method in input.");
		test.done();
	},
	testSearchMethod:function(test){
		var input = {config:{}};
		var valid = util.validateInput(input);
		test.ok(valid.err == "No search method in input.");
		input = {config:{searchMethod :"xyz"}};
		valid = util.validateInput(input);
		test.ok(valid.err =='Search method is not correct. It should be either "geneSet" or "CD".');
		test.done();
	},
	testDbVersion:function(test){
		var input = {config:{
				aggravate:true,
				searchMethod:'geneSet',
				combination:true,
				share:true,
				"db-version":"xyz"
			}};
		var valid = util.validateInput(input);
		test.ok(valid.err=="#/config/db-version -> Object didn't pass validation for format dbVersion: xyz");
		test.done();
	},
	testGeneSetSchema:function(test){
		var input = {config:{searchMethod :"geneSet"}};
		var valid = util.validateInput(input)
		test.ok('err' in valid);
		geneSetInput = {
			config:{
				aggravate:true,
				searchMethod:'geneSet',
				combination:true,
				share:true,
				"db-version":"latest"
			},
			metaData:[],
			data:{
				upGenes:[],
				dnGenes:[]
			}
		}
		valid = util.validateInput(geneSetInput);
		test.ok(valid.err == '#/data/dnGenes -> Array is too short (0), minimum 3');
		geneSetInput.data.dnGenes = ['a','b','c','d','e'];
		valid = util.validateInput(geneSetInput);
		test.ok(valid.err == '#/data/upGenes -> Array is too short (0), minimum 3');
		geneSetInput.data.upGenes = ['a','b','c','d','e'];
		valid = util.validateInput(geneSetInput);
		test.ok('good' in valid);
		geneSetInput.config.aggravate = 5
		valid = util.validateInput(geneSetInput);
		test.ok(valid.err == '#/config/aggravate -> Expected type boolean but found type integer');
		geneSetInput.config.aggravate = false;
		geneSetInput.data.dnGenes = [true,false,true,false,true];
		valid = util.validateInput(geneSetInput);
		test.ok(valid.err == '#/data/dnGenes/4 -> Expected type string but found type boolean');
		geneSetInput.data.dnGenes = ['a','b','d'];
		geneSetInput.metadata = ['a',2,true];
		valid = util.validateInput(geneSetInput);
		test.ok(valid.err == '#/metadata/2 -> Expected type object but found type boolean');
		geneSetInput.metadata = [{}];
		valid = util.validateInput(geneSetInput);
		test.ok('good' in valid);
		test.done()
	},
	testCDSchema:function(test){
		var input = {config:{searchMethod :"CD"}};
		var valid = util.validateInput(input)
		test.ok('err' in valid);
		CDInput = {
			config:{
				aggravate:true,
				searchMethod:'CD',
				combination:true,
				share:true,
				"db-version":"latest"
			},
			metaData:[],
			data:{
				genes:[],
				vals:[]
			}
		}
		valid = util.validateInput(CDInput);
		test.ok(valid.err == '#/data/vals -> Array is too short (0), minimum 5' ||
			valid.err == '#/data/genes -> Array is too short (0), minimum 5');
		CDInput.data.genes = ['a','b','c','d','e'];
		CDInput.data.vals = [1,2,3,4,5];
		valid = util.validateInput(CDInput);
		test.ok('good' in valid);
		CDInput.config.combination = 'abc'
		valid = util.validateInput(CDInput);
		test.ok(valid.err == '#/config/combination -> Expected type boolean but found type string');
		CDInput.config.combination = false;
		CDInput.data.vals = [1,2,3,4,5,6];
		valid = util.validateInput(CDInput);
		test.ok(valid.err == '#/data/genes and #/data/vals should be equal length.')
		CDInput.data.vals = ['a','b','c','d',1];
		valid = util.validateInput(CDInput);
		test.ok(valid.err == '#/data/vals/3 -> Expected type number but found type string')
		test.done()
	}
}

exports.testCountByDate = function(test){
	// only works at GMT-0500 (Easten Standard Time)
	var dateEqual = function(x,y){
		return (x[0]==y[0] && x[1]==y[1] && x[2]==y[2] && x[3] == y[3]);
	}
	var dateEqual2 = function(x,y){
		return (x[0]==y[0] && x[1]==y[1] && x[2]==y[2]);
	}
	var res = {send:function(sentCount){
		test.ok(dateEqual(sentCount[0],[2015,1,30,10]))
		sentCount.forEach(function(e){
			if(dateEqual2(e,[2015,9,22])) test.ok(e[3]==71);
			if(dateEqual2(e,[2015,11,3])) test.ok(e[3]==27);
		});
		test.done();
	}};

	setTimeout(function(){
		// wait until countByDate is populated. 
		// consider prolong the time if test fails
		hdl.countByDate({},res)
	},2000);
}
