var indexControllers = angular.module('indexControllers', []);


var baseURL = window.location.protocol+"//"+window.location.host + "/L1000CDS/";

var process = _.identity;
indexControllers.controller('GeneList', ['$scope', '$http',function($scope,$http){
		
		//default reverse
		$scope.aggravate = false;

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

		if(input){
			// initialize up/dn genes if any input from geo2me. 
			// Also search them if exist
			$scope.upGenes = JSON.parse(input.upGenes).join('\n');
			$scope.dnGenes = JSON.parse(input.dnGenes).join('\n');
			$scope.search();
		}
	}
]);