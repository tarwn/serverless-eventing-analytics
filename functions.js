
// HTTP Functions
const serverless = require('serverless-http');
const app = require('./lib/web/app');

module.exports.httpApp = serverless(app());

// Stream Functions
module.exports.streamRuleProcessor = (event, context, callback) => {
    event.Records.forEach((record) => {
        const payload = new Buffer(record.kinesis.data, 'base64').toString('ascii');
        console.log('Decoded record:', payload);
    });
    callback(null, `Successfully processed ${event.Records.length} records.`);
};