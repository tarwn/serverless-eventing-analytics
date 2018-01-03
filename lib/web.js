const express = require('express');
var bodyParser = require('body-parser');

/// TEMP
var AWS = require('aws-sdk');

// variables
const kinesis_host = "localhost",
    kinesis_port = 4567,
    kinesis_region = "us-east-1",
    kinesis_stream_name = "elistream";

    
const kinesis = new AWS.Kinesis({
    endpoint: `${kinesis_host}:${kinesis_port}`,
    region: kinesis_region,
    apiVersion: '2013-12-02',
    sslEnabled: false
});
/// ---

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

        var putReq = kinesis.putRecord({
            Data: JSON.stringify(incomingEvent),
            PartitionKey: '0',
            StreamName: kinesis_stream_name
        }, function (err, data) { 
            if (err) {
                //TODO: details somewhere
                console.log(err);
                res.status(500).send("Error writing to kinesis");
            }
            else { 
                res.status(200).send("Ok");
            }
        });
    });

    return app;
};