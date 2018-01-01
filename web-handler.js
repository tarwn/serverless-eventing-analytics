const serverless = require('serverless-http');
const web = require('./lib/web');
const app = web();

module.exports.handler = serverless(app);