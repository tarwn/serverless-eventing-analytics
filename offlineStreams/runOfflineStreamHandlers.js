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
const functions = [
    { funName: 'RuleProcessor', handlerPath: '../functions/ruleProcessor/handler', handlerName: 'streamProcessor', kinesisStreamName: process.env.KINESIS_STREAM_NAME_EVENTS },
    { funName: 'AlertProcessor', handlerPath: '../functions/alertProcessor/handler', handlerName: 'streamProcessor', kinesisStreamName: process.env.KINESIS_STREAM_NAME_ALERTS }
];
initialize(functions);

// ---

function initialize(functions) {
    functions.forEach((f) => { 
        run(cacheInvalidated(f), { kinesis: kinesis, streamName: f.kinesisStreamName, console: getLog(f.funName) });
    });
}

function getLog(functionName) {
    return {
        log: (m) => console.log(`\n${functionName}: ${m}`),
        error: (e) => console.error(`\n${functionName}:`, e.message, e.stack)
    };
}

function cacheInvalidated(funOptions) { 
    return (kinesisEvent, context, callback) => { 
        const handler = createHandler(funOptions, {});
        handler(kinesisEvent, context, callback);
    };
}

// borrowed from serverless-offline - temporary until I incorporate it into poller
function createHandler(funOptions, options) {
    if (!options.skipCacheInvalidation) {
      //debugLog('Invalidating cache...');

      for (const key in require.cache) {
        // Require cache invalidation, brutal and fragile.
        // Might cause errors, if so please submit an issue.
        if (!key.match('node_modules')) delete require.cache[key];
      }
    }

    //debugLog(`Loading handler... (${funOptions.handlerPath})`);
    const handler = require(funOptions.handlerPath)[funOptions.handlerName];

    if (typeof handler !== 'function') {
      throw new Error(`Serverless-offline: handler for '${funOptions.funName}' is not a function`);
    }

    return handler;
}

