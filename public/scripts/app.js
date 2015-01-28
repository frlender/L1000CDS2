'use strict';

/* App Module */

var Sigine = angular.module('Sigine', [
  'indexControllers','smart-table','toggle-switch','ui.bootstrap']);


Sigine.directive('selectText',function(){
	return function(scope,element,attrs){
		console.log('de');
		$(element).focus();
		$(element).select();
	}
});