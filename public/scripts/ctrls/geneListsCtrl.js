



indexControllers.controller('geneListsCtrl', ['$scope', '$http', 'buildCDQueryData', 'loadEbovs',
function($scope,$http,buildCDQueryData,loadEbovs){
	$scope.searchCount = null;
	// implement slider for mimic/reverse in the future
	$scope.aggravate = false;

		// blockUI.message('Please wait for a few seconds...')
	var updateCount = function(){
			$http.get(baseURL+'count').success(function(data){
				$scope.searchCount = data;
			});
	}

	updateCount();

	var process = _.identity;
		// $scope.fillInText = function(){
		// 	$http.get('data/example-genes.txt').success(function(data){
		// 		$scope.genes = data;
		// 	});
		// }
	$scope.geneLists = [];
	$scope.geneListCount = 0;
	$scope.allInputValid = false;
	$scope.moreThanOne = false;

	$scope.addGeneList = function(){
		$scope.geneLists.push({tag:"",genes:""});
		$scope.geneListCount += 1;
	}

	$scope.removeGeneList = function(){
		$scope.geneLists.pop();
		$scope.geneListCount -= 1;
	}

	$scope.loadExamples = function(){
			loadEbovs.then(function(data){
				var min = $scope.geneListCount < data.length ?
					$scope.geneListCount : data.length;
				for(var i=0; i<min; i++){
					$scope.geneLists[i].tag = data[i].name;
					$scope.geneLists[i].genes = _.map(_.zip(data[i].genes,data[i].vals),
						function(component){
							return component.join(',');
						}).join('\n');
				}
			})
	}

	$scope.addGeneList();

	$scope.$watch("geneLists",function(geneLists){
		$scope.allInputValid = _.every(geneLists,function(geneList){
			return geneList['genes'];
		});
	},true);

	$scope.$watch("geneListCount",function(geneListCount){
		if(geneListCount>1) $scope.moreThanOne = true;
		else $scope.moreThanOne = false;
	});

	// for test purpose
	// $scope.fillInText = function(){
	// 	var basePath = '../R/test/',
	// 		exampleInputs = [basePath+'ELK1-19687146-Hela cells-human.txt .n.txt',
	// 					basePath+'HSA04540_GAP_JUNCTION.txt .n.txt',
	// 					'data/example-genes-lite.txt']

	// 		$http.get('data/example-genes-lite.txt').success(function(data){
	// 			$scope.geneLists[0].genes = data;
	// 			$scope.geneLists[0].tag = "Enrichr Example";
	// 		});
	// }
	// $scope.fillInText();

	$scope.search = function(){
		console.log($scope.geneLists);
		if($scope.allInputValid){
			var input = _.map($scope.geneLists,buildCDQueryData);

			$http.post(baseURL+"multisearch",{input:input})
				.success(function(data) {
					console.log(data)
			});
		}
	}
}]);
