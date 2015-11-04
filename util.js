// trivial functions here
var fs = require('fs');
var ZSchema = require("z-schema");

fs.readFile('data/pertIDMap.json',function(err,buffer){
	var map = JSON.parse(buffer.toString());
	exports.addExternalPertIDs = function(doc){
		// add pubchem and drugbank IDs
		if(doc.pert_id in map){
			if(map[doc.pert_id]['pubchem']){
				doc.pubchem_id = map[doc.pert_id]['pubchem']
			}
			if(map[doc.pert_id]['drugbank']){
				doc.drugbank_id = map[doc.pert_id]['drugbank']
			}
		}
	};
});


var geneSetSchema = {
	type:'object',
	properties:{
		config:{
			type:'object',
			properties:{
				aggravate:{type:'boolean'},
				searchMethod:{type:'string'},
				combination:{type:'boolean'},
				share:{type:'boolean'},
				"db-version":{type:'string',format:'dbVersion'}
			},
		required:['aggravate','searchMethod','combination','share','db-version']
		},
		data:{
			type:'object',
			properties:{
				upGenes:{type:'array',minItems:3,items:{type:'string'}},
				dnGenes:{type:'array',minItems:3,items:{type:'string'}}
			},
			required:['upGenes','dnGenes']
		},
		metadata:{
			type:'array',
			items:{
				type:'object'
			}
		}
	}
}
var CDSchema = {
	type:'object',
	properties:{
		config:{
			type:'object',
			properties:{
				aggravate:{type:'boolean'},
				searchMethod:{type:'string'},
				combination:{type:'boolean'},
				share:{type:'boolean'},
				"db-version":{type:'string',format:'dbVersion'}
			},
			required:['aggravate','searchMethod','combination','share','db-version']
		},
		data:{
			type:'object',
			properties:{
				genes:{type:'array',minItems:5,items:{type:'string'}},
				vals:{type:'array',minItems:5,items:{type:'number'}}
			},
			required:['genes','vals']
		},
		metadata:{
			type:'array',
			items:{
				type:'object'
			}
		}
	}
}
ZSchema.registerFormat('dbVersion',function(str){
	if(str=='latest' || str=='cpcd-v1.0' || 
		str=='cpcd-gse70138-v1.0' || str=='cpcd-gse70138-lm-v1.0')
		return true
	else return false;
});
var validator = new ZSchema();
exports.validateInput = function(input){
	if(!(input instanceof Object)) return {'err':'Input is not an object.'}
	if(!('config' in input) || !('searchMethod' in input.config))
	return {err:'No search method in input.'}
	if(input.config.searchMethod == 'geneSet'){
		var valid = validator.validate(input,geneSetSchema);
		if(valid) {
			return {good:true}
		}
		else{
			var err = validator.lastReport.errors[0];
			return {err:err.path+' -> '+err.message}
		}
	}else if(input.config.searchMethod == 'CD'){
		var valid = validator.validate(input,CDSchema);
		if(valid) {
			if(input.data.genes.length==input.data.vals.length)
				return {good:true}
			else return {err:'#/data/genes and #/data/vals should be equal length.'}
		}
		else{
			var err = validator.lastReport.errors[0];
			return {err:err.path+' -> '+err.message};
		}
	}else{
		return {err:'Search method is not correct. It should be either "geneSet" or "CD".'}
	}
}
