indexControllers.controller('resultCtrl',['$scope', '$routeParams', 'resultStorage', '$http',
	function($scope, $routeParam, resultStorage, $http){

	if($routeParam.shareID in resultStorage){
		$scope.entries = resultStorage[$routeParam.shareID].entries;
		$scope.shareURL = baseURL+$routeParam.shareId;
		$scope.input = resultStorage[$routeParam.shareID].input;
		initialization();
	}else{
		$http.get(baseURL+$routeParam.shareID).success(function(data){
			$scope.entries = data['results']["topMeta"];
			$scope.shareURL = baseURL + data['results']['shareId'];
			$scope.input = data.input;
			initialization();
		});
	}

	function initialization(){
		$scope.overlap = {};
		$scope.overlap.templateUrl = "partials/overlap.html";
		var overlapKeys = Object.keys($scope.entries[0].overlap).sort();
		$scope.overlap.key1 = overlapKeys[1];
		$scope.overlap.key2 = overlapKeys[0];
	}

	$scope.downloadMeta = function(sig_id){
			var url = baseURL+"meta?sig_id="+sig_id;
			window.location = url;
	}

	

}]);
