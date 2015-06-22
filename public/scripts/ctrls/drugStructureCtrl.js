indexControllers.controller('drugStructureCtrl',['$scope', '$routeParams', 'resultStorage', 
	'$http', 'util', 'localStorageService', '$modal', '$timeout', '$location',
	function($scope, $routeParam, resultStorage, $http, util, local,$modal,
		$timeout,$location){

	var item = local.get($routeParam.shareID);
	$scope.entries = item.result.topMeta;
	$scope.input = item.input;
	var tag = util.getTag($scope.input.meta);
	$scope.tag = tag?tag:{value:"No tag"};
	$scope.direction = $scope.input.config.aggravate?"mimic":"reverse";
	$scope.entries.forEach(function(entry,i){
			entry.rank = i+1;
	});
	$scope.normalizePertName = util.normalizePertName;
	$scope.imgURL = baseURL+"CSS/images/SMARTSviewer/"
	var pert_ids = $scope.entries.map(function(item){
		return item.pert_id;
	});
	if("enrichRes" in item){
		$scope.enrichRes = item.enrichRes;
	}else{
		$http.post(baseURL+'drugEnrich',pert_ids).success(function(enrichRes){
			$scope.enrichRes = enrichRes.map(function(entry){
				entry.overlap = entry.overlap.map(function(item){
					return $scope.entries[pert_ids.indexOf(item)];
				})
				entry.overlap = _.sortBy(entry.overlap,'rank');
				return entry
			});
			item.enrichRes = $scope.enrichRes;
			local.set($routeParam.shareID,item)
		});
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
}])