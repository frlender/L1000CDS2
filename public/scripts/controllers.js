var indexControllers = angular.module('indexControllers', []);


var baseURL = window.location.protocol+"//"+window.location.host + "/L1000CDS2/";

var process = _.identity;
indexControllers.controller('GeneList', ['$scope', '$http', '$modal', 
	function($scope,$http,$modal){
		
		//default values: reverse
		$scope.aggravate = false;
		$scope.shareURL = "";
		$scope.searchCount = null;

		var updateCount = function(){
			$http.get(baseURL+'count').success(function(data){
				$scope.searchCount = data;
			});
		}

		$scope.fillInText = function(){
			$http.get(baseURL+'data/example-up-genes-remove-first-three.txt').success(function(data){
				$scope.upGenes = data;
			});
			$http.get(baseURL+'data/example-dn-genes.txt').success(function(data){
				$scope.dnGenes = data;
			});
		}

		var tidyUp = function(genes){
			 var newGenes = _.unique(S(genes.toUpperCase())
					.trim().s.split("\n"));
				//trim unvisible char like \r after each gene if any
			  newGenes = _.map(newGenes,function(gene){
					return S(gene).trim().s;
				});
			  return newGenes
		}

		$scope.search = function(){
			if($scope.upGenes&&$scope.dnGenes){
				$scope.err = false;
				$http.post(baseURL+"query",{upGenes:tidyUp($scope.upGenes),
											dnGenes:tidyUp($scope.dnGenes),
											aggravate:$scope.aggravate})
					.success(function(data) {
						if("err" in data){
							$scope.err = data["err"][0];
						}else{
							$scope.entries = process(data["topMeta"]);
							// rest API
							$scope.shareURL = baseURL+'history/'+data["shareId"];
						}
				});
			}
		}

		$scope.clear = function(geneListKey){
			$scope[geneListKey] = "";
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
          			return $scope.shareURL;
        			}
      			}
    			});
		}


		// initialization
		if(input){
			$scope.upGenes = input.upGenes.join('\n');
			$scope.dnGenes = input.dnGenes.join('\n');
			if(results){
				// for history route
				$scope.aggravate = input.aggravate;
				$scope.entries = process(results["topMeta"]);
				$scope.shareURL = baseURL+'history/'+results["shareId"];
			}else{
				// for geo2me route. 				
				$scope.search();
			}
		}

		updateCount();
	}
]);


indexControllers.controller('ModalInstanceCtrl', 
	['$scope', '$modalInstance', 'shareURL', 
	function($scope, $modalInstance, shareURL) {
  
 $scope.shouldBeOpened = true;
 $scope.shareURL = shareURL;
 $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };
}]);