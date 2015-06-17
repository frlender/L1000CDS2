
var request = require('request');

debugger;
// Set the headers
var headers = {
    'User-Agent':       'Super Agent/0.0.1',
    'Content-Type':     'application/x-www-form-urlencoded'
}


    // var options = {
    //     url: 'http://127.0.0.1:23239/custom/Sigine',
    //     method: 'POST',
    //     headers: headers,
    //     form: {'upGenes': '["RRP8","PIK3C3","NFKBIB","EGR1"]',
    //         'dnGenes':'["KIF20A","GNB5","PHGDH","RRAGA"]',
    //         'method':'"geneSet"'}
    // }

    var options = {
        url: 'http://127.0.0.1:23239/custom/Sigine',
        method: 'POST',
        headers: headers,
        form: {'input': '{"genes":["RRP8","PIK3C3","NFKBIB","EGR1"],"vals":[2.323,5.632,7.1,9.2]}',
            'method':'"CD"',
            'direction':'"mimic"'}
    }

    // // test error
    // var options = {
    //     url: 'http://127.0.0.1:23239/custom/Sigine',
    //     method: 'POST',
    //     headers: headers,
    //     form: {'input': '{"genes":["a","b","c","d"],"vals":[2.323,5.632,7.1,9.2]}',
    //         'method':'"CD"',
    //         'direction':'"reverse"'}
    // }


    // Start the request
    request(options, function (error, response, body) {
        console.log(response.statusCode)
        if(error) throw error
        if (!error && response.statusCode == 200) {
            // debugger;
            // Print out the response body
            console.log(body,typeof(body))
            // res.send(body);
            // var enrichRes = JSON.parse(body);
            
            // getMeta(JSON.parse(body),res);
        }
    });