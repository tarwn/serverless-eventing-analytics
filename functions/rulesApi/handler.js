var response = require(__dirname + '/response');
var rules = require(__dirname + '/lib/rules');
var alerts = require(__dirname + '/lib/alerts');

module.exports.httpApp = (event, context, callback) => {
    const path = event.requestContext.resourcePath;

    console.log(event);
    
    switch(path){
        case '/rules/getAll':
            rules.getAll(event, callback);
            break;
        case '/rules':
            rules.upsertRule(event, callback);
            break;
        case '/alerts/getAll':
            alerts.getAll(event, callback);
            break;
        default:
            callback(null, response.create(404, {"Error": "API Route: "+ path + " not found!"}));
    }
};
