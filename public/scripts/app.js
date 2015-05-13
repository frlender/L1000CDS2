'use strict';

/* App Module */

var Sigine = angular.module('Sigine', ['indexControllers','ngRoute',
  'smart-table','toggle-switch','ui.bootstrap','blockUI','flexForm']);


Sigine.directive('focusMe', function($timeout, $parse) {
  return {
    link: function(scope, element, attrs) {
      // $(element[0]).select()
      setTimeout(function(){$(element[0]).select()},100);
    }
  };
});


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
      otherwise({
        redirectTo: '/index'
      });
  }]);