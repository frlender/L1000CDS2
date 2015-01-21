var express = require('express');
var app = express();
var bodyParser = require('body-parser');

var sigine = require('./handlers2.js');

app.use('/lsr',express.static(__dirname + '/public'));
var jsonParser = bodyParser.json();

app.post('/lsr/query',jsonParser,sigine.query);
app.get('/lsr/meta',sigine.meta);


app.listen(8182);