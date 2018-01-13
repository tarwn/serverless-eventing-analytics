const express = require('express');
var bodyParser = require('body-parser');

/// TEMP
var AWS = require('aws-sdk');
    
const kinesis = new AWS.Kinesis({
    endpoint: `${process.env.KINESIS_HOST}:${process.env.KINESIS_PORT}`,
    region: process.env.KINESIS_REGION,
    apiVersion: '2013-12-02',
    sslEnabled: false
});
/// ---

module.exports = function() {
    const app = express();

    app.use(express.static(__dirname + '/static'));
    app.use(bodyParser.json());

    app.get('/', function (req, res) {
        res.sendfile("index.html", {root: __dirname + '/static'});
    });

    // faux event api for generating test data
    app.post("/event-api/events", function(req, res){
        const incomingEvent = req.body;
        console.log(`Received an event ${incomingEvent}`);

        var putReq = kinesis.putRecord({
            Data: JSON.stringify(incomingEvent),
            PartitionKey: '0',
            StreamName: process.env.KINESIS_STREAM_NAME_EVENTS
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

    app.post("/alert-api/alerts", function(req, res){
        const incomingAlert = req.body;
        console.log(`Received an alert ${incomingAlert}`);

        var putReq = kinesis.putRecord({
            Data: JSON.stringify(incomingAlert),
            PartitionKey: '0',
            StreamName: process.env.KINESIS_STREAM_NAME_ALERTS
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