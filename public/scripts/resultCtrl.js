indexControllers.controller('resultCtrl',['$scope', '$routeParams', 'resultStorage', '$http',
	function($scope, $routeParam, resultStorage, $http){

	if($routeParam.shareID in resultStorage){
		$scope.entries = resultStorage[$routeParam.shareID].entries;
		$scope.shareURL = baseURL+$routeParam.shareId;
	}else{
		$http.get(baseURL+$routeParam.shareID).success(function(data){
			$scope.entries = data['results']["topMeta"];
		});
	}
}]);
