indexControllers.controller('resultCtrl',['$scope', '$routeParams', 'resultStorage', 
	'$http', 'localStorageService',
	function($scope, $routeParam, resultStorage, $http, local){

	if($routeParam.shareID in resultStorage){
		$scope.entries = resultStorage[$routeParam.shareID].entries;
		$scope.shareURL = baseURL+$routeParam.shareID;
		$scope.input = resultStorage[$routeParam.shareID].input;
		if('uniqInput' in resultStorage[$routeParam.shareID]){
			$scope.uniqInput = resultStorage[$routeParam.shareID].uniqInput;
		}
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
		if($scope.input.meta && $scope.input.meta.length>0){
			$scope.tag = $scope.input.meta.filter(function(item){
				return item.key.toLowerCase() == "tag";
			})[0];
			if(!$scope.tag){
				$scope.tag = $scope.input.meta[0];
			}
		}
		
		if($scope.input.config.searchMethod=="geneSet"){
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
