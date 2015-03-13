'use strict';

/* App Module */

var Sigine = angular.module('Sigine', [
  'indexControllers','smart-table','toggle-switch','ui.bootstrap','blockUI']);


Sigine.directive('focusMe', function($timeout, $parse) {
  return {
    link: function(scope, element, attrs) {
      // $(element[0]).select()
      setTimeout(function(){$(element[0]).select()},100);
    }
  };
});


Sigine.directive('watchStSelected',function(){
	return {
		link:function(scope,element,attrs){
			console.log('watchStSelected',attrs.watchStSelected,
				scope);
			scope.$watch(function(){return element.attr('class')},
				function(newValue){
					if(element.hasClass('st-selected')){
						attrs.watchStSelected = {id:scope.$id,
							entry:scope.entry};
					}else{
						if(attrs.watchStSelected){
							if(scope.$id==attrs.watchStSelected.id){
								attrs.watchStSelected = null;
							}
						}
					}
			});
		}
	}
});