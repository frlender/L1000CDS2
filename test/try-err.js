var hdl = require('../handlers2.js');

var res = {send:function(sentCount){
		// test.ok(dateEqual(sentCount[0]==[2015,1,30,10]))
		// sentCount.forEach(function(e){
		// 	if(dateEqual2(e,[2015,9,22])) test.ok(e[3]==71);
		// 	if(dateEqual2(e,[2015,11,3])) test.ok(e[3]==27);
		// });
		// test.done();

		console.log(sentCount);
	}};

	setTimeout(function(){
		// wait until countByDate is populated. 
		// consider prolong the time if test fails
		console.log('x');
		hdl.countByDate({},res)
	},2000);