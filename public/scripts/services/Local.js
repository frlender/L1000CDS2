services.factory('Local',['localStorageService','util',
	function(localStorage,util) {

			function Local(){
				var self = this;
				var maxLocal = 20,
				showCount = 5,
				localKeys = localStorage.keys(),
				history = {items:[],total:0};
				if(localKeys.length>0){
					// get recent searches.
					localKeys.sort(function(a,b){
						return util.getTimeStamp(b) - util.getTimeStamp(a)
					});

					if(localKeys.length>=maxLocal){
						// remove old IDs
						var removeIds = localKeys.splice(maxLocal,localKeys.length-maxLocal);
						localStorage.remove.apply(this,removeIds);
					}
					history.total = localKeys.length;
				} // end of localKeys.length>0
				this.addHistory = function(){
					var newItems = [];
					localKeys.slice(history.items.length,history.items.length+showCount)
						.forEach(function(id){
						try{
							var item = {};
							item.search = self.get(id);
							item.search = self.backCompact(item.search,id);
							item.tag = util.getTag(item.search.input.meta);
							item.id = id;
							newItems.push(item);
						}catch(e){
							localStorage.remove(id);
							localKeys = localStorage.keys();
						}
					});
					history.items = history.items.concat(newItems);
					return history
				}
				this.getHistory = function(){
					return history;
				}
			}

			_.extend(Local.prototype,{
				isSupported:localStorage.isSupported,
				get:function(id){
					if(!localStorage.isSupported) throw('local storage unsupported.');
					return localStorage.get(id);
				},
				set:function(id,search){
					if(!localStorage.isSupported) throw('local storage unsupported.');
					localStorage.set(id,search);
				},
				backCompact:function(search,id){
					// transform the format of search obj in local storage from old to new if any.
					if('result' in search) return search
					else{
						var newSearch = {};
						newSearch.input = search.input;
						newSearch.result = {};
						newSearch.result.topMeta = search.entries;
						if('uniqInput' in search) newSearch.result.uniqInput = search.uniqInput;
						if('enrichRes' in search) newSearch.enrichRes = search.enrichRes;
						newSearch.shareId = id;
						localStorage.set(id,newSearch);
						return newSearch;
					}
				}
			});
			return Local;
}]);