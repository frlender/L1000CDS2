indexControllers.controller('resultCtrl',['$scope', '$routeParams', 'resultStorage', 
	'$http', 'util', 'localStorageService', '$uibModal', '$timeout', '$location','getSearch',
	'Pagination',
	function($scope, $routeParam, resultStorage, $http, util, local,$modal,
		$timeout,$location,getSearch,Pagination){

	var shareID;
	getSearch($routeParam.shareID,function(search){
		if('err' in search){
			$scope.err = search.err;
			return;
		}
		$scope.entries = search.result.topMeta;
		$scope.shareURL = baseURL+$routeParam.shareID;
		shareID = $routeParam.shareID;
		$scope.input = search.input;
		if('uniqInput' in search.result){
			$scope.uniqInput = search.result.uniqInput;
		}
		if('combinations' in search.result){
			$scope.combinations = search.result.combinations;
			$scope.combinations.forEach(function(e,i){
				e.rank = i+1;
			})
		}
		initialization();
	});

	// function getRanks(arr,reverse){
	// 	if(reverse==undefined) reverse=false;
	// 	if(reverse)
	// 		var compareFun = function(a,b){return b-a};
	// 	else
	// 		var compareFun = function(a,b){return a-b};
	// 	var sorted = arr.slice().sort(compareFun);
	// 	var ranks = arr.slice().map(function(v){ return sorted.indexOf(v)+1 });
	// 	return ranks;
	// }

	function initialization(){
		$scope.IDMap = {};
		$scope.entries.forEach(function(e){
			$scope.IDMap[e.sig_id] = e;
		});
		$scope.normalizePertName = util.normalizePertName;
		if($scope.input.config.searchMethod=="geneSet"){
			var effectiveInput,
			getOverlapSize = function(entry){
				var size = 0;
				for(var key in entry.overlap){
					size+=entry.overlap[key].length
				};
				return size;
			};
			$scope.allHaveSets = true;
		}
		var effectiveInput;// Gene-set method only
		$scope.entries.forEach(function(entry,i){
			entry.rank = i+1;
			// 'DEGcount' in entry for backward compactbility
			if($scope.input.config.searchMethod=="geneSet"){
				if(!('sets' in entry)&&'DEGcount' in entry){
					var overlapSize = getOverlapSize(entry);
					if(!effectiveInput) effectiveInput = Math.round(overlapSize/entry.score);
					entry.sets = [{sets:['A'],size:effectiveInput},
					{sets:['B'],size:entry.DEGcount},{sets:['A','B'],size:overlapSize}];
				}
				if(!('sets' in entry)) $scope.allHaveSets = false;
			};
		});
		try {
			// for front-end downloading table using FileSaver.js
    		$scope.isFileSaverSupported = !!new Blob;
		} catch (e) {
			$scope.isFileSaverSupported = false;
		}
		$scope.pubchemURL = "http://pubchem.ncbi.nlm.nih.gov/summary/summary.cgi?cid=";
		$scope.drugbankURL = "http://www.drugbank.ca/drugs/";
		$scope.lifeURL = "http://life.ccs.miami.edu/life/summary?mode=SmallMolecule&source=BROAD&input="
		$scope.helpURL = baseURL+'help/';
		$scope.geoURL = 'http://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=';
		$scope.harmonizomeURL = 'http://amp.pharm.mssm.edu/Harmonizome/gene/';
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
			$scope.getDegree = function(cosDist,digit){
				digit = digit?digit:1;
				var multiply = Math.pow(10,digit);
				return Math.round(Math.acos(1-cosDist)*180/Math.PI*multiply)/multiply;
			}
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
				if( (key=='up'&&aggravate) || (key=='dn'&&!aggravate) ){
					overlapArr.sort(function(a,b){return b[2]-a[2]});
				}else{
					overlapArr.sort(function(a,b){return a[2]-b[2]});
				}
				var overlapStrArr = [];
				entry._dynamic[key] = [];
				overlapArr.forEach(function(item){
					overlapStrArr.push(item.join(' \t'));
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

	$scope.test = function(entry){
		console.log(entry._targetsOpen);
		entry._targetsOpen = false;
		console.log(entry._targetsOpen);

	}


	$scope.share = function(){
		var modalInstance = $modal.open({
      		templateUrl: baseURL+'share.html',
      		controller: 'ModalInstanceCtrl',
      		// appendTo: $('#modalHooker'),
      		resolve: {
        		shareURL: function () {
          		return location.href;
        		}
      		}
    		});
	}

	$scope.saveFile = function(){
		var delimiter = '\t';
		var score = $scope.input.config.searchMethod=="geneSet"?'score':'1-cos(α)';
		var header = ['Rank',score,'Perturbation','Perturbation LIFE URL',
		'Perturbation PubChem URL', 'Perturbation DrugBank URL','Cell-line',
		'Dose','Time','Signature URL'].join(delimiter);
		var content = $scope.entries.map(function(entry){
			return [entry.rank,entry["score"].toFixed(4),
			entry["pert_desc"]=="-666" || entry["pert_desc"].length > 46 ?entry["pert_id"]:entry["pert_desc"],
			$scope.lifeURL+entry.pert_id, 
			entry.pubchem_id?($scope.pubchemURL+entry.pubchem_id):'None',
			entry.drugbank_id?($scope.drugbankURL+entry.drugbank_id):'None', 
			entry.cell_id,
			entry["pert_dose"]+entry["pert_dose_unit"],
			entry["pert_time"]+entry["pert_time_unit"],
			baseURL+"meta?sig_id="+entry.sig_id].join(delimiter);
		}).join('\n');

		var blob = new Blob([header+'\n'+content], {type: "text/plain;charset=utf-8"});
		saveAs(blob, 'table.'+shareID+".tsv");
	}

	$scope.saveCombination = function(){
		var delimiter = '\t';
		var isGeneset = $scope.input.config.searchMethod=="geneSet";
		var score = $scope.input.config.searchMethod=="geneSet"?'Score':'Orthogonality';
		var header = ['Rank',score,'Combination'].join(delimiter);
		var content = $scope.combinations.map(function(combination){
			var x1 = $scope.IDMap[combination.X1];
			var x2 = $scope.IDMap[combination.X2];
			return [combination.rank,
			isGeneset?combination.value:$scope.getDegree(combination.value,2)+'°',
			x1.rank+'. '+util.normalizePertName(x1),
			x2.rank+'. '+util.normalizePertName(x2)].join(delimiter);
		}).join('\n');
		var blob = new Blob([header+'\n'+content], {type: "text/plain;charset=utf-8"});
		saveAs(blob, 'table.combination.'+shareID+".tsv");
	}

	$scope.reanalyze = function(){
		$location.path('/index/'+shareID);
	}

	$scope.goToStructure = function(){
		$location.path('/enrichedSubtructures/'+shareID);
	}

	$scope.goToClustergrammer = function(){
		util.submitToClustergrammer($scope);
	}

	$scope.predictTarget = function(entry){
		if(!entry._targetsOpen){
			if(!entry.predictedTargets){
				$http.get(baseURL+'predictTarget?sig_id='+entry.sig_id)
				.success(function(data){
					entry.predictedTargets = data.slice(0,20);
					entry._targetsPagination = new Pagination(10);
					entry._targetsOpen = true;
				});
				// var payload = {config:{'target-db-version':'microtaskSignatures-v1.0'},data:{}}
				// if($scope.input.config.searchMethod == 'CD'){
				// 	payload.config.searchMethod = 'CD';
				// 	payload.data.genes = $scope.uniqInput.up.genes.concat($scope.uniqInput.dn.genes);
				// 	payload.data.vals = entry.overlap.up.concat(entry.overlap.dn);
				// }else{
				// 	var map = {}
				// 	Object.keys(entry.overlap).forEach(function(key){
				// 		map[key.split('/')[1]] = key;
				// 	});
				// 	payload.config.searchMethod = 'geneSet';
				// 	payload.data.upGenes = entry.overlap[map['up']]
				// 	payload.data.dnGenes = entry.overlap[map['dn']]
				// 	payload.data.sig_id = entry.sig_id;
				// }
				// $http.post(baseURL+'predictTarget',payload)
				// 	.success(function(data){
				// 		entry.predictedTargets = data;
				// 		entry._targetsPagination = new Pagination(10);
				// 		entry._targetsOpen = true;
				// 	});
			}else{
				entry._targetsOpen = true;
			}
		}
	}

	// $scope.$on('$viewContentLoaded',function(event){
	// 	$timeout(function(){
	// 		// hack to fix the overlap popover wrong position at first click bug in Firefox.
	// 		$('[popover-placement="left"]').first().click();
	// 		$('[popover-placement="left"]').first().click();
	// 	},0)
	// });

}]);

indexControllers.controller('ModalInstanceCtrl', 
	['$scope', '$uibModalInstance', 'shareURL', 
	function($scope, $modalInstance, shareURL) {
  
 $scope.shouldBeOpened = true;
 $scope.shareURL = shareURL;
 $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };
}]);


indexControllers.controller('combinationCtrl',['$scope','$rootScope','$anchorScroll','$location',
	function($scope,$rootScope,$anchorScroll,$location){
	// $location.hash('pertTable');	
	var lastSelected;
	$scope.trigger = function(combination,key){
		var selectedKey = key+'Selected';
		combination[selectedKey] = combination[selectedKey] !== true;
		if(lastSelected) lastSelected.combination[lastSelected.selectedKey] = false;
		if(combination[selectedKey] === true){
			lastSelected = {combination:combination,selectedKey:selectedKey};
			$anchorScroll();
		}else{
			lastSelected = undefined;
			// $location.hash('');
		}

		$rootScope.$broadcast('stHighlight',{
			sig_id:combination[key],
			combinationRank: combination.rank
		});
	}
	
}])