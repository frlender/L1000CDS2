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
 					el.up = diseases[element].up;
 					el.dn = diseases[element].dn;
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
	examples.ebov = loadFactory('data/ebov120minUp.txt','data/ebov120minDn.txt');

	return examples;
}]);

services.factory('matchByNameFactory',function(){
	return  function(diseases,key){
		if(!key) key = 'term';
		return function(name){
			return _.filter(diseases,function(disease){
				return disease[key]==name;
			})[0];
		}
	}
});