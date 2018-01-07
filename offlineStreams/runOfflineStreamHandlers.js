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
        error: (e) => console.error(`\n${functionName}:`, e.message, e.stack)
    };
}    

const ruleLambda = require('../functions/ruleProcessor/handler').streamProcessor;
run(ruleLambda, { kinesis: kinesis, streamName: process.env.KINESIS_STREAM_NAME_EVENTS, console: getLog('RuleProcessor') });

const alertLambda = require('../functions/alertProcessor/handler').streamProcessor;
run(ruleLambda, { kinesis: kinesis, streamName: process.env.KINESIS_STREAM_NAME_ALERTS, console: getLog('AlertProcessor') });


