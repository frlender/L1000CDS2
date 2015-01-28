var app = angular.module('plunker', []);
app.controller('AppController',
    [
      '$scope',
      function($scope) {
        $scope.focusInput = true;
        
  $scope.whatToDismiss=''; // workaround not to close the modal if it is an invalid input
  $scope.focusInput=false;

  $scope.submitUserName= function ()
  {    
    $scope.focusInput = false;
    if($scope.userName1===undefined || $scope.userName1==="")
      {
          alert("Invalid Input");
          return;
      }

    alert("username entered"+$scope.userName1);  
    $scope.whatToDismiss='modal';

  }
        
      }
    ]
  );
  
app.directive('focusMe', function($timeout) {
  return function(scope, element, attrs) {
    scope.$watch(attrs.focusMe, function(value) {
    console.log('focus', value)
      if(value) {
        $timeout(function() {
          element.focus();
        }, 700);
      }
    });
  };
});