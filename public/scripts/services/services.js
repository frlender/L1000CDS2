var services = angular.module('services', []);

services.factory('loadExamples',['$http','$q',
	function($http,$q){
		var deferred = $q.defer();

		$http.get("data/nosology.json")
			.success(function(diseases){
				deferred.resolve(diseases);
		})

		return deferred.promise;

}]);

services.factory('loadGEO',['$http','$q',
	function($http, $q){
		var deferred = $q.defer();

		$http.get("diseases").success(function(diseases){
			deferred.resolve(_.sortBy(diseases,'term'));
		})

		return deferred.promise;
}]);




services.factory('buildQueryData',[function(){

	return function(scope){
		var res = {}
		res.data = {};
		res.config = {};
		res.config.aggravate = scope.aggravate;
		res.config.share = scope.share;
		var lines = S(scope.upGenes.toUpperCase()).trim().split('\n');
		var splits = lines[0].split(',');
		if(splits.length>1){
			res.config.searchMethod = 'CD';
			res.data = {};
			res.data.genes = [],
			res.data.vals = [];
			lines.forEach(function(e){
				var splits = e.split(',')
				res.data.genes.push(S(splits[0]).trim().s);
				res.data.vals.push(parseFloat(S(splits[1]).trim().s));
			});
			return res;
		}else{
			res.config.searchMethod = "geneSet";
			res.data = {};
			var upLines = _.uniq(lines);
			res.data.upGenes = _.map(lines,function(gene){
				return S(gene).trim().s;
			});
			var dnLines = _.uniq(S(scope.dnGenes.toUpperCase()).trim().split('\n'));
			res.data.dnGenes = _.map(dnLines,function(gene){
				return S(gene).trim().s;
			});
			return res;
		}
	}
}])


services.factory('loadEbovs',['$http','$q',
	function($http,$q){
		var deferred = $q.defer();
		$http.get("data/ebovs.json")
			.success(function(diseases){
				var map = {'ebov30min':"EBOV signature 30 minutes",
 				"ebov60min":"EBOV signature 60 minutes",
 				"ebov120min":"EBOV signature 120 minutes"}
 				var order = ["ebov30min","ebov60min","ebov120min"];
 				var res = _.map(order,function(element){
 					var el = {};
 					el.name = map[element];
 					el.genes = diseases[element].genes;
 					el.vals = diseases[element].vals;
 					return el
 				})
				deferred.resolve(res);
		})
		return deferred.promise;
}]);

services.factory('loadExample',['$http','$q',function($http,$q){
	var examples = {}

	function loadFactory(upUrl,dnUrl){
		var load = function(){
			var deferred = $q.defer();
			var DEGs = {};
			$http.get(upUrl).success(function(data){
				DEGs.up = data;
				$http.get(dnUrl).success(function(data){
					DEGs.dn = data;
					deferred.resolve(DEGs);
				});
			});
			return deferred.promise;
		}
		return load;
	}

	examples.default = loadFactory('data/example-up-genes-remove-first-three.txt',
		'data/example-dn-genes.txt');
	examples.signature = function(){
		var deferred = $q.defer();
		$http.get('data/enrichrFuzzy.txt').success(function(data){
			deferred.resolve(data);
		});
		return deferred.promise;
	}

	return examples;
}]);

services.factory('matchByNameFactory',function(){
	return  function(diseases,uniqFunc){
		return function(val){
			return _.filter(diseases,function(disease){
				return uniqFunc(disease)==val;
			})[0];
		}
	}
});

services.factory('resultStorage',function(){
	var results = {};
	return results;
});

services.factory('util',function(){
	// trivial util functions placed here
	var util = {};
	util.getTag = function(meta){
		// get tag object from meta array
		var tag;
		if(meta && meta.length>0){
			tag = meta.filter(function(item){
				return item.key.toLowerCase() == "tag";
			})[0];
			if(!tag){
				tag = meta[0];
			}
		}
		return tag
	}
	util.getTimeStamp = function(id){
		// get the date from a Mongodb ObjectID string.
		var timestamp = id.substring(0,8)
		return new Date( parseInt( timestamp, 16 ) * 1000 )
	}
	util.enrich = function(options) {
    	var defaultOptions = {
    		description: "",
    		popup: false
  		};

  		if (typeof options.description == 'undefined')
    		options.description = defaultOptions.description;
  		if (typeof options.popup == 'undefined')
    		options.popup = defaultOptions.popup;
  		if (typeof options.list == 'undefined')
    		alert('No genes defined.');

  		var form = document.createElement('form');
  		form.setAttribute('method', 'post');
  		form.setAttribute('action', 'http://amp.pharm.mssm.edu/Enrichr/enrich');
  		if (options.popup)
    		form.setAttribute('target', '_blank');
  		form.setAttribute('enctype', 'multipart/form-data');

  		var listField = document.createElement('input');
  		listField.setAttribute('type', 'hidden');
  		listField.setAttribute('name', 'list');
  		listField.setAttribute('value', options.list);
  		form.appendChild(listField);

  		var descField = document.createElement('input');
  		descField.setAttribute('type', 'hidden');
  		descField.setAttribute('name', 'description');
  		descField.setAttribute('value', options.description);
  		form.appendChild(descField);

  		document.body.appendChild(form);
  		form.submit();
  		document.body.removeChild(form);
	}
	util.normalizePertName = function(entry){
		return entry["pert_desc"]=="-666" || entry["pert_desc"].length > 46 ?entry["pert_id"]:entry["pert_desc"]
	}
	return util;
});
