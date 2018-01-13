const Rule = require(process.cwd() + '/functions/ruleProcessor/lib/rule');
const Result = require(process.cwd() + '/functions/ruleProcessor/lib/result');

module.exports.getSampleEvent = (eventType, props) => { 
    const clientEvent = {
        eventType: eventType,
        clientId: "default-client-id"
    };

    if (props) {
        Object.keys(props).forEach((k) => {
            clientEvent[k] = props[k];
        });
    }    

    return clientEvent;
};

module.exports.getSampleRule = (props) => { 
    var rawRule = {
        ruleName: 'unit-test-rule',
        clientId: 'default-client-id',
        where: [],
        partitionBy: [],
        evaluate: {
            type: 'any',
            having: {
                
            }
        }
    };

    Object.keys(props).forEach((k) => { 
        rawRule[k] = props[k];
    });

    return new Rule(rawRule);
};

module.exports.getSampleResult = (events) => { 
    return new Result('unique-rule-key', 'client-id', 'rule-id', events || []);
};