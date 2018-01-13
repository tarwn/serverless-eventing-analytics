'use strict';

const helper = require('./helper');
const rules = require('./lib/rules');
const results = require('./lib/results');

module.exports.streamProcessor = (kinesisEvent, context, callback) => {
    const events = helper.extractEventsFromKinesisEvent(kinesisEvent);
    const eventGroups = helper.groupEventsByClient(events);

    let alertCount = 0;

    Promise.all(eventGroups.map((eventGroup) => { 
        const clientRules = rules.get(eventGroup.clientId);
        const localResults = helper.applyRules(clientRules, eventGroup);

        // open stored buckets to apply local values + evaluate for alerts
        return Promise.all(Object.keys(localResults).map((uniqueResultKey) => { 
            const appliedRule = clientRules.find((cr) => cr.ruleId = localResults[uniqueResultKey].ruleId);
            return results.applyLocalResultToStoredResult(localResults[uniqueResultKey], appliedRule)
                .then((completeResult) => {
                    if (appliedRule.meetsConditionsFor(completeResult)) { 
                        publishAlert(appliedRule.getAlertFor(completeResult));
                        alertCount++;
                        console.log(`ALERTED for ${completeResult.uniqueResultKey}`);
                    }
                    else{
                        console.log(`No alerts for ${completeResult.uniqueResultKey}`);
                    }
                });
        }));
    }))
    .catch((err) => {
        console.log(err);
        callback(err, 'message');
    })
    .then(() => {
        callback(null, `Successfully processed ${kinesisEvent.Records.length} records for ${eventGroups.length} clients, resulting in ${alertCount} alerts`);
    });
};

function publishAlert(alert) { 
    // TODO: kinesis stream for alerts
    console.log("Publish Alert: " + JSON.stringify(alert));
}
