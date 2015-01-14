var request = require('request');


// Set the headers
var headers = {
    'User-Agent':       'Super Agent/0.0.1',
    'Content-Type':     'application/x-www-form-urlencoded'
}


    var options = {
        url: 'http://127.0.0.1:12739/custom/Sigine',
        method: 'POST',
        headers: headers,
        form: {'upGenes': '[RRP8,PIK3C3,NFKBIB,EGR1]',
            'dnGenes':'[KIF20A,GNB5,PHGDH,RRAGA]'}
    }

    // Start the request
    request(options, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            // Print out the response body
            console.log(body,typeof(body))
            // res.send(body);
            // var enrichRes = JSON.parse(body);
            
            getMeta(JSON.parse(body),res);
        }
    });