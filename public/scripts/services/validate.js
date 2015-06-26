services.factory('validate',[
	function(){
	// validate various results.
	return {
		enrichRes:function(enrichRes){
			if(enrichRes &&
				enrichRes.constructor==Array &&
				enrichRes.length > 0 &&
				'term' in enrichRes[0] &&
				'overlap' in enrichRes[0] &&
				enrichRes[0].overlap.length > 0)
				return true;
			else return false;
		},

	}
					
}]);