var express = require('express');
var app = express();
var sigineRouter = express.Router();
var bodyParser = require('body-parser');
var sigine = require('./handlers2.js');


var jsonParser = bodyParser.json({limit:'50mb'});
var urlencodedParser = bodyParser.urlencoded({limit:'50mb',extended:false});



app.set('views','./public/jade');
app.set('view engine','jade');

sigineRouter.use('/',express.static(__dirname + '/public'));

sigineRouter.post('/query',jsonParser,sigine.query);
sigineRouter.post('/signatures',jsonParser,sigine.signatures);

sigineRouter.get('/meta',sigine.meta);
sigineRouter.get('/count',sigine.count);

// diseases example
sigineRouter.get('/disease',sigine.disease);
sigineRouter.get('/diseases',sigine.diseases);

sigineRouter.post('/drugEnrich',jsonParser, sigine.drugEnrich);

sigineRouter.post('/multisearch',jsonParser, sigine.multisearch);

// sigineRouter.post('/input',urlencodedParser,sigine.geo2me);
sigineRouter.get('/:id',sigine.history);




app.use('/L1000CDS2',sigineRouter);

app.listen(8182,function(){
	console.log('listen@8182');
});