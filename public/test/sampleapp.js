//  Build our app module, with a dependency on the angular modal service.
var app = angular.module('sampleapp', ['angularModalService']);

app.controller('SampleController', ['$scope', 'ModalService', function($scope, ModalService) {
  
  $scope.showYesNo = function() {

    ModalService.showModal({
      templateUrl: "../share.html",
      controller: "YesNoController"
    }).then(function(modal) {
      modal.element.modal();
    });

  };

  
}]);