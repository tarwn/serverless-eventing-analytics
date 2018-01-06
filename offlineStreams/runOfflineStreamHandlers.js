const AWS = require('aws-sdk');
const run = require('@rabblerouser/local-kinesis-lambda-runner');
const envFromYaml = require('./utils/envFromYaml');

envFromYaml.config('./config/env.yml','offline');

const kinesis = new AWS.Kinesis({
    endpoint: `${process.env.KINESIS_HOST}:${process.env.KINESIS_PORT}`,
    region: process.env.KINESIS_REGION,
    apiVersion: '2013-12-02',
    sslEnabled: false
});

function getLog(functionName) {
    return {
        log: (m) => console.log(`\n${functionName}: ${m}`),
        error: (e) => console.error(`\n${functionName}:`, e)
    };
}    

const lambda = require('../functions/ruleProcessor/handler').streamProcessor;
run(lambda, { kinesis: kinesis, streamName: process.env.KINESIS_STREAM_NAME, console: getLog('RuleProcessor') });
