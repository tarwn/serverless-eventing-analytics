const AWS = require('aws-sdk');
const pollKinesis = require('./utils/pollKinesis');
const envFromYaml = require('./utils/envFromYaml');

envFromYaml.config('./config/env.yml','offline');

const kinesis = new AWS.Kinesis({
    endpoint: `${process.env.KINESIS_HOST}:${process.env.KINESIS_PORT}`,
    region: process.env.KINESIS_REGION,
    apiVersion: '2013-12-02',
    sslEnabled: false
});

const log = {
    log: (m) => console.log("\nStreamHandler: " + m),
    error: (e) => console.error("\nStreamHandler: ", e)
};

const run = pollKinesis(kinesis, process.env.KINESIS_STREAM_NAME, log);

const lambda = require('../functions').streamRuleProcessor;
run(lambda);
