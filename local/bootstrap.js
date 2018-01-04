var AWS = require('aws-sdk');
require('dotenv').config({ path: './config/offline.env' });

const kinesis = new AWS.Kinesis({
    endpoint: `${process.env.KINESIS_HOST}:${process.env.KINESIS_PORT}`,
    region: process.env.KINESIS_REGION,
    apiVersion: '2013-12-02',
    sslEnabled: false
});

var req = kinesis.createStream({ ShardCount: 1, StreamName: process.env.KINESIS_STREAM_NAME });
req.send(function (err, data) { 
    if (err) {
        if (err.code === 'ResourceInUseException') {
            // Stream already exists, so no problem
            console.log('Kinesis stream already exists');
            process.exit(0);
        }
        else {
            console.log(`Bootstrap failed with error ${err.stack}`);
            process.exit(1);
        }
    }
    else { 
        console.log("Kinesis stream created");
        process.exit(0);
    }
});
