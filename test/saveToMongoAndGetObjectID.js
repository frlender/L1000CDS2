var mongoose = require('mongoose');

mongoose.connect('mongodb://readWriteUser:askQiaonan@localhost/LINCS_L1000');
var Schema = mongoose.Schema({"map":String},{collection:"sigine-share"})
var Share = mongoose.model('Share',Schema);
var Schema2 = mongoose.Schema({"db-version":String,"upGenes":[String],
"dnGenes":[String], "aggravate":Boolean,"res":{sig_ids:[String],scores:[Number]}},{collection:"sigine-store"});
var Store = mongoose.model('Store',Schema2);



var example = {"db-version":"cpcd-v1.0","upGenes":["a","b","c"],
"dnGenes":["d","e"],"aggravate":true,"results":{sig_ids:["de","bc"],scores:[0.1,0.2]}}


var store = new Store(example);
var share = new Share({map:store._id});


store.save(function(err,store){
	if(err) throw err;
	console.log(store._id);
});

share.save(function(err,share){
	if(err) throw err;
	console.log(share._id);
});


// to be tested
shareId = '54c7e4b911a6d20000d5236b'
Share.findOne({_id:shareId})
	.exec(function(err,queryRes){
		if(err) throw err;
		Store.findOne({_id:queryRes.map})
			.exec(function(err,queryRes){
				if(err) throw err;
				console.log(queryRes);
				// queryRes.results = getMetas(queryRes.results);
				// res.send(queryRes);
			});
	});


var query = Share.findOne({_id:shareId})
query.exec(function(err,queryRes){
	if(err) throw err;
	var query = Store.findOne({_id:queryRes.map});
	query.exec(function(err,queryRes){
		if(err) throw err;
		console.log(queryRes);
	})
});