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

function startFunction(functionName, streamName, lambda) {
    const log = {
        log: (m) => console.log(`\n${functionName}: ${m}`),
        error: (e) => console.error(`\n${functionName}:`, e)
    };

    const run = pollKinesis(kinesis, streamName, log);
    run(lambda);
}

// Kinesis functions
startFunction('RuleProcessor', process.env.KINESIS_STREAM_NAME, require('../functions').streamRuleProcessor);
