services.factory('query',['$http',
	function($http){
	// all server interactions defined here.
	return {
		getSearch:function(id,cb){
			$http.get(baseURL+id).success(function(data){
				var search = {};
				search.input = data.input;
				search.result = data.results;
				cb(search);
			});
		},
		search:function(){
			
		}
	}
					
}]);