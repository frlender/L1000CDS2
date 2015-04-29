services.factory('buildCDQueryData',[function(){
	return function(geneList){
		var res = {};
		res.searchMethod = 'CD';
		res.aggravate = false;
		res.tag = geneList.tag;
		var lines = S(geneList.genes.toUpperCase()).trim().split('\n');
		res.genes = [];
		res.vals = [];
		lines.forEach(function(e){
			var splits = e.split(',')
			res.genes.push(S(splits[0]).trim().s);
			res.vals.push(parseFloat(S(splits[1]).trim().s));
		});
		return res;
	}
}])