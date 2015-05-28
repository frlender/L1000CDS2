indexControllers.controller('resultCtrl',['$scope', '$routeParams', 'resultStorage', 
	'$http', 'util', 'localStorageService', '$modal',
	function($scope, $routeParam, resultStorage, $http, util, local, $modal){

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
		var tag = util.getTag($scope.input.meta);
		$scope.tag = tag?tag:{value:"No tag"};
		$scope.direction = $scope.input.config.aggravate?"mimic":"reverse";
		if($scope.input.config.searchMethod=="geneSet"){
			$scope.overlap.templateUrl = "partials/overlap_geneSet.html";
			var overlapKeys = Object.keys($scope.entries[0].overlap).sort();
			$scope.overlap.key1 = overlapKeys[1];
			$scope.overlap.key2 = overlapKeys[0];
			$scope.overlap.title = "overlap: input/signature";
			$scope._keyMap = function(key){
				return {input:key.slice(0,2),sig:key.slice(3,5)}
			};
			$scope.buildOverlap = function(key,entry){
				var overlapStr = entry.overlap[key].join('\n');
				var keyMap = $scope._keyMap(key)
				var inputDirection = keyMap.input;
				var sigDirection = keyMap.sig;
				return overlapStr?overlapStr:("The input "+inputDirection+ " genes has no overlap with the "+sigDirection+" genes in signature.");
			}
			$scope.enrichr = function(key,entry){
				var enrichrInput = {popup:true};
				enrichrInput.list = entry.overlap[key].join('\n');
				var values = {};
				values.inputDirection = key.slice(0,2);
				values.sigDirection = key.slice(3,5);
				values.pertName = entry["pert_desc"]=="-666" || entry["pert_desc"].length > 46 ?entry["pert_id"]:entry["pert_desc"];
				values.tag = $scope.tag?$scope.tag.value:"input";
				var template = "overlap between {{inputDirection}} genes of {{tag}} and {{sigDirection}} genes of {{pertName}}"
				enrichrInput.description = S(template).template(values).s;
				util.enrich(enrichrInput);
			}
		}else{
			$scope.overlap.templateUrl = "partials/overlap_CD.html";
			var overlapKeys = Object.keys($scope.entries[0].overlap).sort();
			$scope.overlap.key1 = overlapKeys[1];
			$scope.overlap.key2 = overlapKeys[0];
			$scope._aggravate = $scope.input.config.aggravate;
			$scope._sigKeyMap = {}; // map input key to signature key
			$scope._sigKeyMap[$scope.overlap.key1] = $scope._aggravate?$scope.overlap.key1:$scope.overlap.key2;
			$scope._sigKeyMap[$scope.overlap.key2] = $scope._aggravate?$scope.overlap.key2:$scope.overlap.key1;
			$scope.overlap.title = "overlap: (gene symbol) (input value) (signature value)"
			$scope.buildOverlap = function(key,entry){
				var aggravate = $scope.input.config.aggravate;
				var cdVec = entry.overlap[key]
				if(!("_dynamic" in entry)){
					// store gene list
					entry._dynamic = {};
				}
				var overlapArr = _.zip($scope.uniqInput[key].genes,
				$scope.uniqInput[key].vals, cdVec);
				var filter = aggravate?function(item){return item[1]*item[2]>0}:
				function(item){return item[1]*item[2]<0};
				var overlapStrArr = [];
				entry._dynamic[key] = [];
				overlapArr.forEach(function(item){
					overlapStrArr.push(item.join('\t'));
					if(filter(item)){
						entry._dynamic[key].push(item[0]);
					}
				});
				var overlapStr = overlapStrArr.join('\n');
				return overlapStr?overlapStr:("The input "+key.slice(0,2)+ " genes has no overlap with the genes in signature.");
			}
			$scope.enrichr = function(key,entry){
				var enrichrInput = {popup:true};
				enrichrInput.list = entry._dynamic[key].join('\n');
				var values = {};
				values.inputDirection = key;
				values.sigDirection = $scope._sigKeyMap[key];
				values.pertName = entry["pert_desc"]=="-666" || entry["pert_desc"].length > 46 ?entry["pert_id"]:entry["pert_desc"];
				values.tag = $scope.tag?$scope.tag.value:"input";
				var template = "overlap between {{inputDirection}} genes of {{tag}} and {{sigDirection}} genes of {{pertName}}";
				enrichrInput.description = S(template).template(values).s;
				util.enrich(enrichrInput);
			}
		}
	}

	$scope.downloadMeta = function(sig_id){
			var url = baseURL+"meta?sig_id="+sig_id;
			window.location = url;
	}


		$scope.share = function(){
			var modalInstance = $modal.open({
      			templateUrl: baseURL+'share.html',
      			controller: 'ModalInstanceCtrl',
      			resolve: {
        			shareURL: function () {
          			return location.href;
        			}
      			}
    			});
		}

}]);

indexControllers.controller('ModalInstanceCtrl', 
	['$scope', '$modalInstance', 'shareURL', 
	function($scope, $modalInstance, shareURL) {
  
 $scope.shouldBeOpened = true;
 $scope.shareURL = shareURL;
 $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };
}]);