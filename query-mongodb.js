// all functions for querying mongodb
// by Qiaonan Duan, 1/27/2015

var mongoose = require('mongoose');
mongoose.connect('mongodb://readWriteUser:askQiaonan@localhost/L1000CDS2');

// for cpcd collection
var Schema = mongoose.Schema({"pert_desc":String,"cell_id":String,
    "pert_dose":String,"pert_dose_unit":String,"pert_time":String,
    "pert_time_unit":String},{collection:"cpcd"})
var Expm = mongoose.model('Expm',Schema);

// for sigine-share and sigine-store collections
var Schema = mongoose.Schema({"map":String},{collection:"sigine-share-2"})
var Share = mongoose.model('Share',Schema);

// for diseases collection
var SchemaDisease = mongoose.Schema({"term":String,"desc":String,genes:[String],
    vals:[Number]},{collection:"diseases"});
var Disease = mongoose.model('Disease',SchemaDisease);

var Schema2 = mongoose.Schema({
    "config":Object,
    "data":Object,
    "meta":Array
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


exports.getCount = function(res){
	var query = Count.findOne();
	query.exec(function(err,queryRes){
		if(err) throw err;
		res.send(queryRes.count+"");
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




