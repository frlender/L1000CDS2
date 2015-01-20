'use strict';

/* App Module */

var Sigine = angular.module('Sigine', [
  'indexControllers','smart-table','toggle-switch']);

console.log('gut');


  // custom dotdotdot directive
// Sigine.directive("toggleswitch",function() {
// 	return function($scope, $element, attrs) {
// 		console.log('d',$($element))
// 		$($element).bootstrapToggle({
// 			on: 'Aggravate', 
// 			off: 'Reverse'
// 		});
// 	};
// });