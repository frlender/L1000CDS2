'use strict';

/* App Module */

var Sigine = angular.module('Sigine', [
  'indexControllers','smart-table','toggle-switch','ui.bootstrap']);


Sigine.directive('focusMe', function($timeout, $parse) {
  return {
    link: function(scope, element, attrs) {
      // $(element[0]).select()
      setTimeout(function(){$(element[0]).select()},100);
    }
  };
});