'use strict';
var Rule = require('./rule');

// Examples:
//  - any machine switches status more than N times in Y period: partion by machine, any: count of status property change > N, limit by time
//  - all machines offline simultaneously: partition by machine, all: latest of status property = value
//  - any machine in X status longer than Y: partition by machine, any: no change to status property, limit by time (need at least 1 prior state logged, even if before time)
//  - any test event: no partition, any: latest of eventType property = testEvent

module.exports.get = (clientId) => {
    return fakeRules[clientId] || [];
};

const fakeRules = {
    "client-01": [
            // any test event for client 1
            new Rule({
                ruleId: 'hardcoded-rule-01',
                clientId: "client-01",
                where: [{ 'property': 'eventType', 'equals': 'test-event' }],
                partitionBy: [],
                evaluate: {
                    type: 'any',
                    having: {
                        calc: 'latest',
                        property: 'eventType',
                        equals: 'test-event'
                    }
                }
            }),
            // all machines enter stopping state
            new Rule({
                ruleId: 'hardcoded-rule-02',
                clientId: "client-01",
                where: [{ 'property': 'machineId', 'equals': '*' }],
                partitionBy: ['machineId'],
                evaluate: {
                    type: 'all',
                    having: {
                        calc: 'latest',
                        property: 'state',
                        equals: 'stopped'
                    }
                }
            })
    ],
    "client-02": [
            // any machine reaches stopping state
            new Rule({
                ruleId: 'hardcoded-rule-03',
                clientId: "client-02",
                where: [{ 'property': 'machineId', 'equals': '*' }],
                partitionBy: ['machineId'],
                evaluate: {
                    type: 'any',
                    having: {
                        calc: 'latest',
                        property: 'state',
                        equals: 'stopped'
                    }
                }
            })
        ]
};