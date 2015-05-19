var indexControllers = angular.module('indexControllers', ["services"]);
var baseURL = window.location.protocol+"//"+window.location.host + "/L1000CDS2/";



indexControllers.controller('index',['$scope','$http',function($scope,$http){
	$scope.searchCount = null;
	$scope.updateCount = function(){
		//this function will be inherited by any controller in ng-view
		$http.get(baseURL+'count').success(function(data){
			$scope.searchCount = data;
		});
	}
	$scope.updateCount();
}]);



var process = _.identity;
indexControllers.controller('GeneList', ['$scope', '$http', '$modal', 
	'loadExample', 'buildQueryData', 'resultStorage', '$location', 'ffBuild',
	function($scope,$http,$modal,loadExample,buildQueryData,resultStorage,$location,ffBuild){
		
		//default values
		// reverse
		$scope.aggravate = false;
		$scope.shareURL = "";
		$scope.inputMeta = [
			{key:"Tag",value:"",dataPlaceholder:"add a tag"},
       		{key:"Cell", value:""},
       		{key:"Perturbation", value:""},
       		{key:"Time point", value:""}
       	];
		

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
			var input = buildQueryData($scope);
			input.meta = ffBuild($scope.inputMeta);
			$http.post(baseURL+"query",input)
				.success(function(data) {
					if("err" in data){
						$scope.err = data["err"][0];
					}else{
						$scope.updateCount();
						resultStorage[data['shareId']] = {};
						resultStorage[data['shareId']].entries = data["topMeta"];
						resultStorage[data['shareId']].input = input;
						if('uniqInput' in data){
							resultStorage[data['shareId']].uniqInput = data.uniqInput;
						}
						$location.path('/result/'+data['shareId']);
					}
			});
		}

		$scope.clear = function(geneListKey){
			$scope[geneListKey] = "";
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
    			$http.get(baseURL+'disease?id='+res['_id'])
    			.success(function(res){
    				var lines = []
	    			res.genes.forEach(function(e,i){
	    				lines.push(e+','+res.vals[i])
	    			})
      				$scope.upGenes = lines.join('\n');
      				$scope.search();
    			});
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
	['$scope', '$modalInstance', 'loadGEO', 'matchByNameFactory', 
	function($scope, $modalInstance, loadGEO, matchByNameFactory) {
  
 // $scope.shouldBeOpened = true;
 // $scope.shareURL = shareURL;
 // $scope.cancel = function () {
 //    $modalInstance.dismiss('cancel');
 //  };

 	var matchByName;
 	$('.st-selected').removeClass('st-selected');
 	loadGEO.then(function(diseases){
 		matchByName = matchByNameFactory(diseases,function(disease){
 			return disease['term']+disease['desc'];
 		});
 		$scope.diseases = diseases;
 	});

 	$scope.selectedEntry = 'not-yet';

 	$scope.cancel = function() {
    	$modalInstance.dismiss('cancel');
  	};

  	$scope.ok = function(){
  		var term = $('.st-selected td:first-child').text();
  		var desc = $('.st-selected td:last-child').text()
  		if(term){
  			$modalInstance.close(matchByName(term+desc));
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
 		matchByName = matchByNameFactory(diseases,function(disease){
 			return disease['name'];
 		});
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