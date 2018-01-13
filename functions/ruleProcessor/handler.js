'use strict';

const helper = require('./helper');
const rules = require('./lib/rules');
const results = require('./lib/results');

module.exports.streamProcessor = (kinesisEvent, context, callback) => {
    const events = helper.extractEventsFromKinesisEvent(kinesisEvent);
    const eventGroups = helper.groupEventsByClient(events);

    Promise.all(eventGroups.map((group) => evaluateAndStore(group)))
    .catch((err) => {
        console.log(err);
        callback(err, 'message');
    })
    .then((nestedAlerts) => {
        var alerts = flatten(nestedAlerts);

        alerts.forEach((alert) => {
            publishAlert(alert);
        });

        callback(null, `Successfully processed ${kinesisEvent.Records.length} records for ${eventGroups.length} clients, resulting in ${alerts.length} alerts`);
    });
};

function evaluateAndStore(eventGroup){
    const clientRules = rules.get(eventGroup.clientId);
    const localResults = helper.applyRules(clientRules, eventGroup);

    // open per-rule results to merge with stored results and evaluate for alert
    return Promise.all(localResults.map((result) => { 
        const appliedRule = clientRules.find((cr) => cr.ruleId = result.ruleId);
        return results.applyLocalResultToStoredResult(result, appliedRule)
            .then((completeResult) => {
                if (appliedRule.meetsConditionsFor(completeResult)) { 
                    console.log(`ALERTED for ${completeResult.uniqueResultKey}`);
                    return appliedRule.getAlertFor(completeResult);
                }
                else{
                    console.log(`No alerts for ${completeResult.uniqueResultKey}`);
                    return null;
                }
            });
    }))
    .then((nestedAlerts) => {
        return flatten(nestedAlerts);
    });
}

function flatten(nestedArray){
    return nestedArray.reduce((acc, cur) => {
        if(cur != null)
            return acc.concat(cur);
        else
            return acc;
    }, []);
}

function publishAlert(alert) { 
    // TODO: kinesis stream for alerts
    console.log("Publish Alert: " + JSON.stringify(alert));
}
