var request = require('request');

// Set the headers
var headers = {
    'User-Agent':       'Super Agent/0.0.1',
    'Content-Type':     'application/x-www-form-urlencoded'
}


exports.query = function(input,cb){
    if(input.searchMethod == "geneSet"){
        if(input.aggravate){
        var upGenes = JSON.stringify(input.upGenes),
            dnGenes = JSON.stringify(input.dnGenes);
        }else{
            // reverse search
            var upGenes = JSON.stringify(input.dnGenes),
                dnGenes = JSON.stringify(input.upGenes);
        }

        var options = {
            url: 'http://127.0.0.1:23236/custom/Sigine',
            method: 'POST',
            headers: headers,
            form: {'upGenes': upGenes,
                'dnGenes':dnGenes,
                'method':'"geneSet"'}
        }
    }else if(input.searchMethod == "CD"){
        
        if(input.aggravate) direction = 'mimic';
        else direction = 'reverse';
        var options = {
            url: 'http://127.0.0.1:23236/custom/Sigine',
            method: 'POST',
            headers: headers,
            form: {'input': JSON.stringify(input.input),
                'method':'"CD"',
                'direction':'"'+direction+'"'}
        }
    }else{
        cb({"err":"search method is not CD or geneSet. It is "+input.searchMethod+"."})
    }

    // Start the request
    request(options, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            // Print out the response body
            // console.log(body,typeof(body))
            // res.send(body);
            // var enrichRes = JSON.parse(body);
            var topMatches = JSON.parse(body);

            cb(topMatches);
        }
    });
}
