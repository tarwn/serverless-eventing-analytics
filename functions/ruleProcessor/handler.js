'use strict';

const helper = require('./helper');
const rules = require('./lib/rules');
const results = require('./lib/results');

module.exports.streamProcessor = (kinesisEvent, context, callback) => {
    const events = helper.extractEventsFromKinesisEvent(kinesisEvent);
    const eventGroups = helper.groupEventsByClient(events);

    let alertCount = 0;

    eventGroups.forEach((eventGroup) => { 
        const clientRules = rules.get(eventGroup.clientId);
        const localResults = helper.applyRules(clientRules, eventGroup);

        // open stored buckets to apply local values + evaluate for alerts
        Object.keys(localResults).forEach((uniqueResultKey) => { 
            const appliedRule = clientRules.find((cr) => cr.ruleId = completeResult.ruleId);
            const completeResult = results.applyLocalResultToStoredResult(localResults[uniqueResultKey], rule);
            if (appliedRule.meetsConditions(updatedResults)) { 
                publishAlert(rule.getAlertFor(updatedResults));
                alertCount++;
            }
        });
    });

    callback(null, `Successfully processed ${kinesisEvent.Records.length} records for ${eventGroups.length} clients, resulting in ${alertCount} alerts`);
};

function publishAlert(alert) { 
    // TODO: kinesis stream for alerts
}
