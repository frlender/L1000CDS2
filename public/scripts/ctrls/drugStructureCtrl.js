indexControllers.controller('drugStructureCtrl',['$scope', '$routeParams', 
	'$http', 'util', 'Local', '$location', 'getSearch','resultStorage','validate',
	function($scope, $routeParam, $http, util, Local,
		$location,getSearch,resultStorage,validate){

	getSearch($routeParam.shareID,function(search){
		$scope.entries = search.result.topMeta;
		$scope.input = search.input;
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
		if("enrichRes" in search){
			if(validate.enrichRes(search.enrichRes))
				$scope.enrichRes = search.enrichRes;
			else $scope.err = "No substructures enriched";
		}else{
			$http.post(baseURL+'drugEnrich',pert_ids).success(function(enrichRes){
				if(validate.enrichRes(enrichRes)){
					$scope.enrichRes = enrichRes.map(function(entry){
						entry.overlap = entry.overlap.map(function(item){
							return $scope.entries[pert_ids.indexOf(item)];
						})
						entry.overlap = _.sortBy(entry.overlap,'rank');
						return entry
					});
					search.enrichRes = search.enrichRes;
					resultStorage[$routeParam.shareID] = search;
					try{Local.prototype.set($routeParam.shareID,search);}catch(e){};
				}else{
					$scope.err = "No substructures enriched";
				}
			});
		}
	});

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