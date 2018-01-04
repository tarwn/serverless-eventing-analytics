var AWS = require('aws-sdk');

require('dotenv').config({ path: './config/offline.env' });

const kinesis = new AWS.Kinesis({
    endpoint: `${process.env.KINESIS_HOST}:${process.env.KINESIS_PORT}`,
    region: process.env.KINESIS_REGION,
    apiVersion: '2013-12-02',
    sslEnabled: false
});

const evt = {
    Data: JSON.stringify({ "eventType": "test-event", "client-side-time": new Date() }),
    PartitionKey: "0",
    StreamName: process.env.KINESIS_STREAM_NAME
};

var req = kinesis.putRecord(evt);
req.send(function (err, data) { 
    if (err) {
        console.log(`PutEvent failed with error ${err.stack}`);
        process.exit(1);
    }
    else { 
        console.log("Event added");
        process.exit(0);
    }
});
