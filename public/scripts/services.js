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

services.factory('matchByNameFactory',function(){
	return  function(diseases){
		return function(name){
			return _.filter(diseases,function(disease){
				return disease.term==name;
			})[0];
		}
	}
});