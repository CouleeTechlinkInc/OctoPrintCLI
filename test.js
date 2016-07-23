var request = require("request");

request({
    url: 'http://172.29.1.211/api/printer?apikey=D2FC2BFCA1F54610B370D2774C80822E',
    json: true
}, function (error, response, body) {

    if (!error && response.statusCode === 200) {
        console.log(body) // Print the json response
    }
});
