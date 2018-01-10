'use strict';
var Rule = require('./rule');

module.exports.get = (clientId) => {
    return [
        new Rule({ ruleId: 'hardcoded-rule-01', clientId: clientId, parameters: [{ 'property': 'eventType', 'equivalence': '*' }] })
    ];
};