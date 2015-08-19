var indexControllers = angular.module('indexControllers', ["services"]);
var baseURL = window.location.origin+window.location.pathname;



indexControllers.controller('index',['$scope','$http','$location',
	function($scope,$http,$location){
	$scope.searchCount = null;
	$scope.updateCount = function(){
		//this function will be inherited by any controller in ng-view
		$http.get(baseURL+'count').success(function(data){
			$scope.searchCount = data.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
		});
	}
	$scope.updateCount();
	$scope.directToIndex = function(){
		$location.path('/index');
	}
	$scope.isNew = function(addedTime){
		var oneMonth = 2.62974e9; // milliseconds in a month.
		return (new Date().getTime()-addedTime) > 2*oneMonth?false:true;
	}
}]);



var process = _.identity;
indexControllers.controller('GeneList', ['$scope', '$http', '$modal', 'loadExample',
	'buildQueryData', 'resultStorage', '$location', 'ffClean', 'Local',
	'util', '$routeParams','getSearch','localStorageService',
	function($scope,$http,$modal,loadExample,buildQueryData,resultStorage,$location,
		ffClean,Local,util,$routeParams,getSearch,lss){

		if('shareID' in $routeParams){
			$scope.hasInput = true;
			getSearch($routeParams.shareID,function(search){
				var input = search.input;
				$scope.aggravate = input.config.aggravate;
				$scope.share = input.config.share;
				$scope.dbVersion = input.config['db-version'];
				$scope.combination = input.config.combination;
				$scope.inputMeta = input.meta.length==0?
				[{key:"Tag",value:"",dataPlaceholder:"add a tag"}]:input.meta;
				if(input.config.searchMethod=="geneSet"){
					$scope.upGenes = input.data.upGenes.join('\n');
					$scope.dnGenes = input.data.dnGenes.join('\n');
				}else{
					$scope.upGenes = _.zip(input.data.genes,input.data.vals).map(function(item){
						return item.join(',');
					}).join('\n');
				}
			});
		}else{
			$scope.hasInput = false;
			//default values
			// reverse
			$scope.aggravate = false;
			// $scope.shareURL = "";
			$scope.share = false;
			$scope.combination = false;
			$scope.dbVersion = 'cpcd-gse70138-v1.0';
			$scope.inputMeta = [
				{key:"Tag",value:"",dataPlaceholder:"add a tag"},
       			{key:"Cell", value:""},
       			{key:"Perturbation", value:""},
       			{key:"Time point", value:""}
       		];
       }

       $scope.clearInput = function(){
       	 $location.path('/index/');
       }

       // for history
       $scope.history = {items:[],total:0};
       if(Local.prototype.isSupported){
       		var local = new Local();
       		$scope.history = local.getHistory();
       		$scope.addHistory = function(){
       			$scope.history = local.addHistory();
       		}
       		$scope.addHistory();
       }



		$scope.goToResultView = function(id,search){
			// search is an object.
			if(!(id in resultStorage)){
				resultStorage[id] = search;
			}
			$location.path('/result/'+id);
		};

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
			input.meta = ffClean($scope.inputMeta);
			$http.post(baseURL+"query2",input)
				.success(function(data) {
					if("err" in data){
						$scope.err = data["err"][0];
					}else{
						$scope.updateCount();
						var search = {};
						search.result = data;
						search.input = input;
						// local  storage for history functionality
						try{Local.prototype.set(data['shareId'],search);}catch(e){};
						$scope.goToResultView(data['shareId'],search);
					}
			});
		}

		$scope.clear = function(geneListKey){
			$scope[geneListKey] = "";
		}



		$scope.showExamples = function(){
			var modalInstance = $modal.open({
      			templateUrl: baseURL+'examples.html',
      			controller: 'exampleModalCtrl',
      			size:"lg",
      			resolve: {
      				aggravate:function(){
      					return $scope.aggravate;
      				}
      			}
    		});

    		modalInstance.result.then(function (res) {
    			$scope.inputMeta = [
					{key:"Tag",value:res.term},
       				{key:"Tissue", value:res.desc}
       			];
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

		$scope.showLigands = function(){
			var modalInstance = $modal.open({
      			templateUrl: baseURL+'ligands.html',
      			controller: 'ligandModalCtrl'
    		});

    		modalInstance.result.then(function (scope) {
    			$scope.inputMeta = [
					{key:"Tag",value:scope.selectedEntry.term},
       			];
       			$scope.aggravate = scope.aggravate;
       			$scope.dbVersion = 'cpcd-gse70138-lm-v1.0';
    			$http.get(baseURL+'ligand?id='+scope.selectedEntry['_id'])
    			.success(function(res){
    				var lines = []
	    			res.genes.forEach(function(e,i){
	    				lines.push(e+','+res.vals[i])
	    			})
      				$scope.upGenes = lines.join('\n');
      				// $scope.search();
    			});
    		});
		}

		$scope.loadDefaultExample = function(){
			loadExample.default().then(function(DEGs){
				$scope.upGenes = DEGs.up;
				$scope.dnGenes = DEGs.dn;
				$scope.inputMeta[0].value = "Gene-set Example";
			});
		}

		$scope.loadSignatureExample = function(){
			loadExample.signature().then(function(data){
				$scope.upGenes = data;
				$scope.inputMeta[0].value = "Signature Example";
			})
		}

		$scope.showEbovs = function(){
			var modalInstance = $modal.open({
      			templateUrl: baseURL+'ebovs.html',
      			controller: 'ebovsModalCtrl',
      			resolve: {
      				aggravate:function(){
      					return $scope.aggravate;
      				}
      			}
    		});

    		modalInstance.result.then(function (res) {
    			var time = res.name.split(' ')[2] + res.name.split(' ')[3];
    			$scope.inputMeta = [
					{key:"Tag",value:res.name},
       				{key:"Cell", value:"Hela"},
       				{key:"Perturbation", value:"Ebola virus"},
       				{key:"Time point", value:time}
       			];
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



indexControllers.controller('exampleModalCtrl',
	['$scope', '$modalInstance', 'loadGEO', 'matchByNameFactory', 'aggravate',
	function($scope, $modalInstance, loadGEO, matchByNameFactory,aggravate) {

	$scope.aggravate = aggravate
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


indexControllers.controller('ligandModalCtrl',
	['$scope', '$modalInstance', 'loadLigands', 'matchByNameFactory',
	function($scope, $modalInstance, loadLigands, matchByNameFactory) {

 	loadLigands.then(function(ligands){
 		$scope.ligands = ligands;
 	});

 	$scope.aggravate = true;
 	console.log($scope.aggravate);
 	$scope.selectedEntry = undefined;
 	$scope.aggravate = true;

 	$scope.toggleLigand = function(ligand){
 		 	console.log($scope.aggravate);

 		if(ligand.__selected) {
 			ligand.__selected = false;
 			$scope.selectedEntry = undefined;
 		}
 		else {
 			ligand.__selected = true;
 			if($scope.selectedEntry) $scope.selectedEntry.__selected = false;
 			$scope.selectedEntry = ligand;
 		}
 	}

 	$scope.cancel = function() {
    	$modalInstance.dismiss('cancel');
  	};

  	$scope.ok = function(){
  		if($scope.selectedEntry){
  			$modalInstance.close($scope);
  		}else{
  			$modalInstance.dismiss('cancel');
  		}
  	};
}]);



indexControllers.controller('ebovsModalCtrl',
	['$scope', '$modalInstance', 'loadEbovs', 'matchByNameFactory', 'aggravate',
	function($scope, $modalInstance, loadEbovs, matchByNameFactory,aggravate) {
	$scope.aggravate = aggravate;
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
