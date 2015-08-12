services.factory('getSearch',['resultStorage','Local','query',
	function(resultStorage,Local,query){
		function getSearch(id,cb){
			var last = function(){
				query.getSearch(id,function(search){
					if('err' in search){
						cb(search);
						return;
					}
					resultStorage[id] = search;
					try{Local.prototype.set(id,search);}
					catch(e){}
					cb(search);
				});
			}
			if(id in resultStorage){
				cb(resultStorage[id])
			}else if(Local.prototype.isSupported){
				var search;
				try{search = Local.prototype.get(id);}
				catch(e){last()};
				// validation
				if(search&&('result' in search)&&('topMeta' in search.result)){
					resultStorage[id] = search;
					cb(search)
				}else{last()};
			}else{
				last();
			}
		}
		return getSearch;
}]);