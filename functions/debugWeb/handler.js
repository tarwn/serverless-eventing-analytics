const serverless = require('serverless-http');
const app = require(__dirname + '/app');

module.exports.httpApp = serverless(app());