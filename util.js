// trivial functions here
var fs = require('fs');
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
