var AWS = require('aws-sdk');

// variables
const kinesis_host = "localhost",
    kinesis_port = 4567,
    kinesis_region = "us-east-1";

const kinesis = new AWS.Kinesis({
    endpoint: `${kinesis_host}:${kinesis_port}`,
    region: kinesis_region,
    apiVersion: '2013-12-02',
    sslEnabled: false
});

kinesis.listStreams(console.log.bind(console));