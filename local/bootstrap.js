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

var req = kinesis.createStream({ ShardCount: 1, StreamName: kinesis_stream_name });
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
