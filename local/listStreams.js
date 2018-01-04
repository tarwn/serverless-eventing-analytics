var AWS = require('aws-sdk');

require('dotenv').config({ path: './config/offline.env' });

const kinesis = new AWS.Kinesis({
    endpoint: `${process.env.KINESIS_HOST}:${process.env.KINESIS_PORT}`,
    region: process.env.KINESIS_REGION,
    apiVersion: '2013-12-02',
    sslEnabled: false
});

kinesis.listStreams(console.log.bind(console));