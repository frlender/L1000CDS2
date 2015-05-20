indexControllers.controller('resultCtrl',['$scope', '$routeParams', 'resultStorage', 
	'$http', 'util', 'localStorageService',
	function($scope, $routeParam, resultStorage, $http, util, local){

	if($routeParam.shareID in resultStorage){
		$scope.entries = resultStorage[$routeParam.shareID].entries;
		$scope.shareURL = baseURL+$routeParam.shareID;
		$scope.input = resultStorage[$routeParam.shareID].input;
		if('uniqInput' in resultStorage[$routeParam.shareID]){
			$scope.uniqInput = resultStorage[$routeParam.shareID].uniqInput;
		}
		initialization();
	}else if(_.contains(local.keys(),$routeParam.shareID)){
		var item = local.get($routeParam.shareID)
		$scope.entries = item.entries;
		$scope.shareURL = baseURL+$routeParam.shareID;
		$scope.input = item.input;
		if('uniqInput' in item){
			$scope.uniqInput = item.uniqInput;
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
		$scope.tag = util.getTag($scope.input.meta);
		
		if($scope.input.config.searchMethod=="geneSet"){
			$scope.overlap.templateUrl = "partials/overlap_geneSet.html";
			var overlapKeys = Object.keys($scope.entries[0].overlap).sort();
			$scope.overlap.key1 = overlapKeys[1];
			$scope.overlap.key2 = overlapKeys[0];
			$scope.overlap.title = "overlap: input/signature";
			$scope.buildOverlap = function(key,entry){
				var overlapStr = entry.overlap[key].join('\n');
				var inputDirection = key.slice(0,2);
				var sigDirection = key.slice(3,5);
				return overlapStr?overlapStr:("The input "+inputDirection+ " genes has no overlap with the "+sigDirection+" genes in signature.");
			}
		}else{
			$scope.overlap.templateUrl = "partials/overlap_CD.html";
			var overlapKeys = Object.keys($scope.entries[0].overlap).sort();
			$scope.overlap.key1 = overlapKeys[1];
			$scope.overlap.key2 = overlapKeys[0];
			$scope.overlap.title = "overlap: (gene symbol) (input value) (signature value)"
			$scope.buildOverlap = function(key,cdVec){
				var overlapStr = _.map(_.zip($scope.uniqInput[key].genes,
				$scope.uniqInput[key].vals, cdVec),function(arr){
					return arr.join('\t');
				}).join('\n');
				return overlapStr?overlapStr:("The input "+key.slice(0,2)+ " genes has no overlap with the genes in signature.");
			}
		}
	}

	$scope.downloadMeta = function(sig_id){
			var url = baseURL+"meta?sig_id="+sig_id;
			window.location = url;
	}

}]);
