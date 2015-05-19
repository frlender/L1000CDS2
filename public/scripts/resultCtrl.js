indexControllers.controller('resultCtrl',['$scope', '$routeParams', 'resultStorage', '$http',
	function($scope, $routeParam, resultStorage, $http){

	if($routeParam.shareID in resultStorage){
		$scope.entries = resultStorage[$routeParam.shareID].entries;
		$scope.shareURL = baseURL+$routeParam.shareID;
		$scope.input = resultStorage[$routeParam.shareID].input;
		if('uniqInput' in resultStorage[$routeParam.shareID]){
			$scope.uniqInput = resultStorage[$routeParam.shareID].uniqInput;
		}
		// debugger;
		initialization();
	}else{
		$http.get(baseURL+$routeParam.shareID).success(function(data){
			$scope.entries = data['results']["topMeta"];
			$scope.shareURL = baseURL + data['results']['shareId'];
			$scope.input = data.input;
			if('uniqInput' in data.results){
				$scope.uniqInput = data.results.uniqInput;
			}
			initialization();
		});
	}

	function initialization(){
		$scope.overlap = {};
		if($scope.input.searchMethod=="geneSet"){
			$scope.overlap.templateUrl = "partials/overlap_geneSet.html";
			var overlapKeys = Object.keys($scope.entries[0].overlap).sort();
			$scope.overlap.key1 = overlapKeys[1];
			$scope.overlap.key2 = overlapKeys[0];
			$scope.overlap.title = "overlap: input/signature"
		}else{
			$scope.overlap.templateUrl = "partials/overlap_CD.html";
			var overlapKeys = Object.keys($scope.entries[0].overlap).sort();
			$scope.overlap.key1 = overlapKeys[1];
			$scope.overlap.key2 = overlapKeys[0];
			$scope.overlap.title = "overlap: (gene symbol) (input value) (signature value)"
			$scope.buildOverlap = function(key,cdVec){
				return _.map(_.zip($scope.uniqInput[key].genes,
				$scope.uniqInput[key].vals, cdVec),function(arr){
					return arr.join('\t');
				}).join('\n');
			}
		}
	}

	$scope.downloadMeta = function(sig_id){
			var url = baseURL+"meta?sig_id="+sig_id;
			window.location = url;
	}



}]);
