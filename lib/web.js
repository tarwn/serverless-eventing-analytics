const express = require('express');
var bodyParser = require('body-parser');

module.exports = function() {
    const app = express();
    
    app.use(express.static('static'));
    app.use(bodyParser.json());

    app.get('/', function (req, res) {
        res.sendfile("index.html", {root: './static'});
    });

    // faux event api for generating test data
    app.post("/event-api/events", function(req, res){
        const incomingEvent = req.body;
        console.log(`Received an event ${incomingEvent}`);
        res.status(200).send("Ok");
    });

    return app;
};