'use strict';

var Result = require("./lib/result");

module.exports.extractEventsFromKinesisEvent = (kinesisEvent) => {
    return kinesisEvent.Records.map((record) => {
        return new Buffer(record.kinesis.data, 'base64').toString('ascii');
    });
};

module.exports.groupEventsByClient = (events) => {
    const clientEventsByClient = {};
    events.forEach((event) => {
        const clientIndex = `client:${event.clientId}`;

        if (clientEventsByClient[clientIndex] === undefined) {
            clientEventsByClient[clientIndex] = {
                clientId: event.clientId,
                events: []
            };
            clientEventsByClient[clientIndex].events.push(event);
        }
    });
    return Object.keys(clientEventsByClient)
        .map((clientIndex) => clientEventsByClient[clientIndex]);
};

module.exports.applyRules = (clientRules, clientEventsGroup) => { 
    const localRuleResults = {};

    // group incoming events into prospective buckets
    clientRules.forEach((rule) => {
        clientEventsGroup.events.forEach((event) => {
            if (rule.appliesTo(event)) {
                const ruleKey = rule.generateKey(event);
                if (localRuleResults[ruleKey] === undefined) {
                    localRuleResults[ruleKey] = new Result(ruleKey, rule.clientId, rule.ruleId, []);
                }
                localRuleResults[ruleKey].addEvent(event);
            }
        });
    });

    return localRuleResults;
};
