var indexControllers = angular.module('indexControllers', ["services"]);


var baseURL = window.location.protocol+"//"+window.location.host + "/L1000CDS2/";

var process = _.identity;
indexControllers.controller('GeneList', ['$scope', '$http', '$modal', 
	'loadExample', 'buildQueryData', 'blockUI',
	function($scope,$http,$modal,loadExample,buildQueryData,blockUI){
		
		//default values
		// reverse
		$scope.aggravate = false;
		$scope.shareURL = "";
		$scope.searchCount = null;

		blockUI.message('in 2 seconds...')
		var updateCount = function(){
			$http.get(baseURL+'count').success(function(data){
				$scope.searchCount = data;
			});
		}

		$scope.inputType = function(){
			var res = false;
			if($scope.upGenes){
				var splits = S($scope.upGenes).trim().split('\n')[0].split(',')
				if(splits.length>1){
					var val = parseFloat(splits[1])
					if(!isNaN(val)&&isFinite(val))
						res = "CD"
				}else{
					if($scope.dnGenes) res = "geneSet"
				}
			}
			return res
		}

		$scope.search = function(){
			$scope.err = false;
			$http.post(baseURL+"query",buildQueryData($scope))
				.success(function(data) {
					if("err" in data){
						$scope.err = data["err"][0];
					}else{
						$scope.entries = process(data["topMeta"]);
						// rest API
						$scope.shareURL = baseURL+data["shareId"];
					}
					updateCount();
			});
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

		$scope.showExamples = function(){
			var modalInstance = $modal.open({
      			templateUrl: baseURL+'examples.html',
      			controller: 'exampleModalCtrl',
      			size:"lg"
    		});

    		modalInstance.result.then(function (res) {
      			$scope.upGenes = res.up.join('\n');
      			$scope.dnGenes = res.dn.join('\n');
      			$scope.search();
    		});
		}

		$scope.loadDefaultExample = function(){
			loadExample.default().then(function(DEGs){
				$scope.upGenes = DEGs.up;
				$scope.dnGenes = DEGs.dn;
			})
		}

		$scope.loadSignatureExample = function(){
			loadExample.signature().then(function(data){
				$scope.upGenes = data;
			})
		}

		$scope.showEbovs = function(){
			var modalInstance = $modal.open({
      			templateUrl: baseURL+'ebovs.html',
      			controller: 'ebovsModalCtrl',
    		});

    		modalInstance.result.then(function (res) {
    			var lines = []
    			res.genes.forEach(function(e,i){
    				lines.push(e+','+res.vals[i])
    			})
      			$scope.upGenes = lines.join('\n');
      			$scope.search();
    		});
		}


		// initialization
		if(input){
			if(input.searchMethod == "geneSet"){
				$scope.upGenes = input.upGenes.join('\n');
				$scope.dnGenes = input.dnGenes.join('\n');
			}else if(input.searchMethod == "CD"){
				$scope.upGenes = _.map(_.zip(input.input.genes,input.input.vals),
					function(component){
						return component.join(',');
					}).join('\n');
			}else{
				$scope.err = "Invalid initialization."
			}

			if(results){
				// for history route
				$scope.aggravate = input.aggravate;
				$scope.entries = process(results["topMeta"]);
				$scope.shareURL = baseURL+results["shareId"];
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


indexControllers.controller('exampleModalCtrl', 
	['$scope', '$modalInstance', 'loadExamples', 'matchByNameFactory', 
	function($scope, $modalInstance, loadExamples, matchByNameFactory) {
  
 // $scope.shouldBeOpened = true;
 // $scope.shareURL = shareURL;
 // $scope.cancel = function () {
 //    $modalInstance.dismiss('cancel');
 //  };

 	var matchByName;
 	$('.st-selected').removeClass('st-selected');
 	loadExamples.then(function(diseases){
 		matchByName = matchByNameFactory(diseases);
 		$scope.diseases = diseases;
 	});

 	$scope.selectedEntry = 'not-yet';

 	$scope.cancel = function() {
    	$modalInstance.dismiss('cancel');
  	};

  	$scope.ok = function(){
  		var selectedName = $('.st-selected td:first-child').text();
  		if(selectedName){
  			$modalInstance.close(matchByName(selectedName));
  		}else{
  			$modalInstance.dismiss('cancel');
  		}
  		
  	};

}]);


indexControllers.controller('ebovsModalCtrl', 
	['$scope', '$modalInstance', 'loadEbovs', 'matchByNameFactory', 
	function($scope, $modalInstance, loadEbovs, matchByNameFactory) {
  
 // $scope.shouldBeOpened = true;
 // $scope.shareURL = shareURL;
 // $scope.cancel = function () {
 //    $modalInstance.dismiss('cancel');
 //  };

 	var matchByName;
 	$('.st-selected').removeClass('st-selected');
 	loadEbovs.then(function(diseases){
 		matchByName = matchByNameFactory(diseases,'name');
 		$scope.diseases = diseases;
 	});

 	$scope.selectedEntry = 'not-yet';

 	$scope.cancel = function() {
    	$modalInstance.dismiss('cancel');
  	};

  	$scope.ok = function(){
  		var selectedName = $('.st-selected td:first-child').text();
  		if(selectedName){
  			$modalInstance.close(matchByName(selectedName));
  		}else{
  			$modalInstance.dismiss('cancel');
  		}
  		
  	};

}]);