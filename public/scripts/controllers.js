var indexControllers = angular.module('indexControllers', []);


var baseURL = window.location.protocol+"//"+window.location.host + "/sigine/";

var process = _.identity;
indexControllers.controller('GeneList', ['$scope', '$http',function($scope,$http){
		$scope.fillInText = function(){
			$http.get('data/example-up-genes.txt').success(function(data){
				$scope.upGenes = data;
			});
			$http.get('data/example-dn-genes.txt').success(function(data){
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
				
				$http.post(baseURL+"query",{upGenes:tidyUp($scope.upGenes),
											dnGenes:tidyUp($scope.dnGenes)})
					.success(function(data) {
					$scope.entries = process(data);
				});
			}
		}	
	}
]);