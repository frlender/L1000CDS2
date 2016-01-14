// all functions for querying mongodb
// by Qiaonan Duan, 1/27/2015

var mongoose = require('mongoose');
var config = require('config');

mongoose.connect(config.get('dbUrl'));

// for cpcd collection
var Schema = mongoose.Schema({"pert_desc":String,"cell_id":String,
    "pert_dose":String,"pert_dose_unit":String,"pert_time":String,
    "pert_time_unit":String},{collection:"cpcd-gse70138"})
var Expm = mongoose.model('Expm',Schema);

// for sigine-share and sigine-store collections
var Schema = mongoose.Schema({"map":String},{collection:"sigine-share-2"})
var Share = mongoose.model('Share',Schema);

// for diseases collection
var SchemaDisease = mongoose.Schema({"term":String,"desc":String,genes:[String],
    vals:[Number]},{collection:"diseases"});
var Disease = mongoose.model('Disease',SchemaDisease);

// for ligands collection
var SchemaLigand = mongoose.Schema({"term":String, genes:[String],
    vals:[Number]},{collection:"ligands"});
var Ligand = mongoose.model('Ligand',SchemaLigand);

var SchemaCcle = mongoose.Schema({"cell":String, "tissue":String, genes:[String],
    vals:[Number]},{collection:"ccle"});
var CcleCell = mongoose.model('CcleCell',SchemaCcle);

// for target prediction
var SchemaMicrotaskSignatures = mongoose.Schema({'hs_gene_symbol':String,
    'mm_gene_symbol':String,'id':String,'organism':String},{collection:'microtaskSignatures'})
var MicrotaskSignatures = mongoose.model('MicrotaskSignatures',SchemaMicrotaskSignatures);

var Schema2 = mongoose.Schema({
    "config":Object,
    "data":Object,
    "meta":Array,
    "user":Object
},
    {collection:"sigine-store-2"});
var Store = mongoose.model('Store',Schema2);

var Schema3 = mongoose.Schema({"count":Number},{collection:"sigine-count"});
var Count = mongoose.model('Count',Schema3);


exports.getMeta = function(sig_id,callback){
    var query = Expm.findOne({sig_id:sig_id}).lean().exec(function(err,doc){
        if(err) throw err;
       	callback(doc);
    });
}

exports.getTimeBracket = function(cb){
     var query = Store.find().sort({'_id':1}).select('_id');
     var brackets = [];
     var currentYear,currentMonth,currentDay,currentCount;
     var t;
     query.exec(function(err,queryRes){
        queryRes.forEach(function(e,i){
            t = i;
            // debugger;

            var timestamp = e._id.toString().substring(0,8);
            var date = new Date( parseInt( timestamp, 16 ) * 1000 );
            if(i==0){
                currentYear = date.getYear()+1900;
                currentMonth = date.getMonth()+1;
                currentDay = date.getDate();
                currentCount = 0;
            }
            if(currentDay == date.getDate()){
                currentCount ++;
            }else{
                brackets.push([currentYear,currentMonth,currentDay,currentCount]);
                currentYear = date.getYear()+1900;
                currentMonth = date.getMonth()+1;
                currentDay = date.getDate();
                currentCount = 1;
            }
        });
        brackets.push([currentYear,currentMonth,currentDay,currentCount]);
        cb(brackets);
     });
}

//get meta information by sig_ids and send results to client.
exports.getMetas = function(topExpms,callback){
    // topExpms structure:
    // topExpms -- [sig_ids]
    //          -- [scores]

    // map is necessary to sort the query results in the order of topExpms
    var map = {};
    topExpms["sig_ids"].forEach(function(e,i) {
        map[e] = i;
    });

    var query = Expm.find({sig_id:{$in:topExpms["sig_ids"]}})
        .select('-_id sig_id pert_id pert_desc cell_id pert_dose pert_dose_unit pert_time pert_time_unit').lean();

    // console.log(map);
    query.exec(function(err,queryRes){
        if(err) throw err;
        // console.log(queryRes.slice(0,2),'aaaa');
        var topMeta = [];
        queryRes.forEach(function(e){
            var idx = map[e["sig_id"]];
            // console.log(idx);
            topMeta[idx] = e;
            topMeta[idx].score = topExpms["scores"][idx];
            topMeta[idx].overlap = topExpms.overlap[idx];
            if('DEGcount' in topExpms)
            topMeta[idx].DEGcount = topExpms.DEGcount[idx];
        });
        // console.log('topMeta',topMeta.slice(0,3))
        callback(topMeta);
    });
}

exports.signaturesFromIDs = function(sig_ids,res){
	var map = {};
   	sig_ids.forEach(function(e,i) {
        	map[e] = i;
    });

    var query = Expm.find({sig_id:{$in:sig_ids}})
        .select('-_id').lean();

    // console.log(map);
    query.exec(function(err,queryRes){
        if(err) throw err;
        // console.log(queryRes.slice(0,2),'aaaa');
        var signatures = [];
        queryRes.forEach(function(e){
            var idx = map[e["sig_id"]];
            // console.log(idx);
            signatures[idx] = e;
        });
        // console.log('topMeta',topMeta.slice(0,3))
        res.send(signatures);
    });
}

// save search input
exports.saveInput = function(saveDoc){
	var store = new Store(saveDoc);
	var share = new Share({map:store._id});

	store.save(function(err,store){
		if(err) throw err;
	});

	share.save(function(err,share){
		if(err) throw err;
	});

	return share._id;
}


exports.getSharedInput = function(sharedId,cb){
    console.log(sharedId);
	if(!mongoose.Types.ObjectId.isValid(sharedId)){
		cb({"err":"invalid URL!"})
	}else{
		var query = Share.findOne({_id:sharedId});
		query.exec(function(err,queryRes){
			if(err) throw err;
			if(!queryRes){
				cb({"err":"invalid history ID!"})
			}else{
				var query = Store.findOne({_id:queryRes.map}).lean();
				// query.select('upGenes dnGenes aggravate db-version -_id');
				query.exec(function(err,queryRes){
					if(err) throw err;
					cb(queryRes);
				})
			}
		});
	}
}


exports.getCount = function(cb){
	var query = Count.findOne();
	query.exec(function(err,queryRes){
		if(err) throw err;
        cb(queryRes.count);
		// res.send(queryRes.count+"");
	});
};

exports.incCount = function(){
	Count.update({$inc:{count:1}},function(err,num){
		if(err) throw err;
		// console.log(num);
	});
};

exports.diseases = function(res){
    var query = Disease.find().select('term desc').lean();
    query.exec(function(err,queryRes){
        if(err) throw err;
        res.send(queryRes);
    });
}

exports.disease = function(id,res){
    var query = Disease.findOne({_id:id}).sort('term').select('-_id -term -desc').lean();
    query.exec(function(err,queryRes){
        if(err) throw err;
        res.send(queryRes);
    });
}

exports.ligands = function(res){
    var query = Ligand.find().select('term').lean();
    query.exec(function(err,queryRes){
        if(err) throw err;
        res.send(queryRes);
    });
}

exports.ligand = function(id,res){
    var query = Ligand.findOne({_id:id}).sort('term').select('-_id -term').lean();
    query.exec(function(err,queryRes){
        if(err) throw err;
        res.send(queryRes);
    });
}

exports.ccleCells = function(res){
    var query = CcleCell.find().select('cell tissue').lean();
    query.exec(function(err,queryRes){
        if(err) throw err;
        res.send(queryRes);
    });
}

exports.ccleCell = function(id,res){
    var query = CcleCell.findOne({_id:id}).select('-_id -cell -tissue').lean();
    query.exec(function(err,queryRes){
        if(err) throw err;
        res.send(queryRes);
    });
}

exports.getMicrotaskSignatures = function(topExpms,cb){
     var map = {};
    topExpms["sig_ids"].forEach(function(e,i) {
        map[e] = i;
    });
    var query = MicrotaskSignatures.find({id:{$in:topExpms["sig_ids"]}})
    .select('-_id id hs_gene_symbol mm_gene_symbol organism').lean();
    query.exec(function(err,queryRes){
        if(err) throw err;
        var signatures = [];
        queryRes.forEach(function(e){
            var idx = map[e["id"]];
            // console.log(idx);
            signatures[idx] = e;
            signatures[idx].score = topExpms['scores'][idx];
        });
        // console.log('topMeta',topMeta.slice(0,3))
        cb(signatures);
    });
}