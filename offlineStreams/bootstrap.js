const AWS = require('aws-sdk');
const envFromYaml = require('./utils/envFromYaml');

envFromYaml.config('./config/env.yml','offline');

const kinesis = new AWS.Kinesis({
    endpoint: `${process.env.KINESIS_HOST}:${process.env.KINESIS_PORT}`,
    region: process.env.KINESIS_REGION,
    apiVersion: '2013-12-02',
    sslEnabled: false
});

ensureStreamExists(kinesis, process.env.KINESIS_STREAM_NAME);

function ensureStreamExists(kinesis, streamName){
    var req = kinesis.createStream({ ShardCount: 1, StreamName: streamName });
    req.send(function (err, data) { 
        if (err) {
            if (err.code === 'ResourceInUseException') {
                // Stream already exists, so no problem
                console.log(`Bootstrap: Success - Kinesis stream '${streamName}' already exists`);
                process.exit(0);
            }
            else {
                console.log(`Bootstrap: Failed - Create Kinesis stream '${streamName}' failed with error ${err.stack}`);
                process.exit(1);
            }
        }
        else { 
            console.log(`Bootstrap: Success - Kinesis stream '${streamName}' created`);
            process.exit(0);
        }
    });
}