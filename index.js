var express = require('express');
var app = express();
var bodyParser = require('body-parser');

var sigine = require('./handlers.js');

app.use('/sigine',express.static(__dirname + '/public'));
var jsonParser = bodyParser.json();

app.post('/sigine/query',jsonParser,sigine.query);


app.listen(8182);