var express = require('express');
var app = express();
var sigineRouter = express.Router();
var bodyParser = require('body-parser');
var sigine = require('./handlers2.js');


// sigineRouter.use('/CSS',express.static(__dirname + '/public/CSS'));
// sigineRouter.use('/libraries',express.static(__dirname + '/public/libraries'));
// sigineRouter.use('/scripts',express.static(__dirname + '/public/scripts'));
// sigineRouter.use('/data',express.static(__dirname + '/public/data'));



var jsonParser = bodyParser.json();
var urlencodedParser = bodyParser.urlencoded({extended:false});

app.set('views','./public/jade');
app.set('view engine','jade');

sigineRouter.use('/',express.static(__dirname + '/public'));

sigineRouter.post('/query',jsonParser,sigine.query);
sigineRouter.get('/meta',sigine.meta);

sigineRouter.post('/input',urlencodedParser,sigine.geo2me);


app.use('/L1000CDS',sigineRouter);

app.listen(8182);