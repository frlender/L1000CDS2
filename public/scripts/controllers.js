var indexControllers = angular.module('indexControllers', []);


var baseURL = window.location.protocol+"//"+window.location.host + "/sigine/";

var process = _.identity;
indexControllers.controller('GeneList', ['$scope', '$http',function($scope,$http){
		$scope.fillInText = function(){
			$http.get('data/example-genes.txt').success(function(data){
				$scope.genes = data;
			});
		}
		$scope.search = function(){
			if($scope.genes){
				var input = _.unique(S($scope.genes.toUpperCase())
					.trim().s.split("\n"));
				//trim unvisible char like \r after each gene if any
				input = _.map(input,function(gene){
					return S(gene).trim().s;
				});
				$http.post(baseURL+"query",{input:input})
					.success(function(data) {
					$scope.entries = process(data);
				});
			}
		}	
	}
]);