'use strict';

/* App Module */

var Sigine = angular.module('Sigine', ['indexControllers','ngRoute',
  'smart-table','toggle-switch','ui.bootstrap','blockUI','flexForm','LocalStorageModule']);


Sigine.directive('focusMe', ['$timeout','$parse',function($timeout, $parse) {
  return {
    link: function(scope, element, attrs) {
      // $(element[0]).select()
      setTimeout(function(){$(element[0]).select()},100);
    }
  };
}]);

Sigine.directive('overlapClose',function(){
  return {
    link: function(scope,element,attrs){
      $(element).click(function(){
        $(this).closest('.popover').siblings().click();
      });
    }
  };
})


Sigine.config(['$routeProvider',
  function($routeProvider) {
    $routeProvider.
      when('/index', {
        templateUrl: 'partials/index.html',
        controller: 'GeneList'
      }).
      when('/result/:shareID', {
        templateUrl: 'partials/result.html',
        controller: 'resultCtrl'
      }).
      when('/index/:shareID',{
        templateUrl: 'partials/index.html',
        controller: 'GeneList'
      }).
      when('/enrichedStructures/:shareID',{
        templateUrl: 'partials/drugStructure.html',
        controller: 'drugStructureCtrl'
      }).
      otherwise({
        redirectTo: '/index'
      });
  }]);


Sigine.config(['localStorageServiceProvider', function (localStorageServiceProvider) {
  localStorageServiceProvider
    .setPrefix('Sigine')
    .setStorageType('localStorage')
    .setNotify(true, true)
}]);