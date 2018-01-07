'use strict';

const assert = require('chai').assert;
const defaults = require("../defaults");
const Rule = require(process.cwd() + '/functions/ruleProcessor/lib/rule');

describe("appliesTo", () => { 

    it("returns true when the event satisifies the rule's parameters", () => { 
        var event = defaults.getSampleEvent('machineStatusChange', { 'machineId': 'machine-00' });
        var rule = defaults.getSampleRule({ parameters: [{ 'property': 'eventType', 'equivalence': 'machineStatusChange' }] });

        var result = rule.appliesTo(event);

        assert.isTrue(result);
    });

    it("returns false when the event does not satisfy the rule's parameters", () => { 
        var event = defaults.getSampleEvent('machineStatusChange', { 'machineId': 'machine-00' });
        var rule = defaults.getSampleRule({ parameters: [{ 'property': 'eventType', 'equivalence': 'somethingElse' }] });

        var result = rule.appliesTo(event);

        assert.isFalse(result);
    });
    
    it("returns false when the rule has no parameters to match on", () => { 
        var event = defaults.getSampleEvent('machineStatusChange', { 'machineId': 'machine-00' });
        var rule = defaults.getSampleRule({ parameters: [] });

        var result = rule.appliesTo(event);

        assert.isFalse(result);
    });

    it("returns true when the event satisifies the all of the rule's parameters", () => { 
        var event = defaults.getSampleEvent('machineStatusChange', { 'machineId': 'machine-00' });
        var rule = defaults.getSampleRule({
            parameters: [
                { 'property': 'eventType', 'equivalence': 'machineStatusChange' },
                { 'property': 'machineId', 'equivalence': 'machine-00' }
            ]
        });

        var result = rule.appliesTo(event);

        assert.isTrue(result);
    });

    it("returns false when the event does not satisfy all of the rule's parameters", () => { 
        var event = defaults.getSampleEvent('machineStatusChange', { 'machineId': 'machine-00' });
        var rule = defaults.getSampleRule({
            parameters: [
                { 'property': 'eventType', 'equivalence': 'somethingElse' },
                { 'property': 'machineId', 'equivalence': 'machine-00' }
            ]
        });

        var result = rule.appliesTo(event);

        assert.isFalse(result);
    });
    
    it("returns true when the event satisifies the '*' for a parameter equivalence", () => { 
        var event = defaults.getSampleEvent('machineStatusChange', { 'machineId': 'machine-00' });
        var rule = defaults.getSampleRule({ parameters: [{ 'property': 'machineId', 'equivalence': '*' }] });

        var result = rule.appliesTo(event);

        assert.isTrue(result);
    });

    it("returns false when the event does not satisfy the '*' for a parameter equivalence (does not have property)", () => { 
        var event = defaults.getSampleEvent('machineStatusChange', { 'machineId': 'machine-00' });
        var rule = defaults.getSampleRule({ parameters: [{ 'property': 'aNonexistentFieldForEvent', 'equivalence': '*' }] });

        var result = rule.appliesTo(event);

        assert.isFalse(result);
    });
});

describe("generateKey", () => { 
    
    it("should generate a unique key for the rule and 2 events that have different parameter equivalence", () => { 
        var event1 = defaults.getSampleEvent('machineStatusChange', { 'machineId': 'machine-01' });
        var event2 = defaults.getSampleEvent('machineStatusChange', { 'machineId': 'machine-02' });
        var rule = defaults.getSampleRule({ parameters: [{ 'property': 'machineId', 'equivalence': '*' }] });
        
        var result1 = rule.generateKey(event1);
        var result2 = rule.generateKey(event2);

        assert.notEqual(result1, result2, 'Generated keys are not the same');
    });

    it("should generate the same unique key for a rule and 2 events that have the same parameter equivalence", () => { 
        var event1 = defaults.getSampleEvent('machineStatusChange', { 'machineId': 'machine-01' });
        var event2 = defaults.getSampleEvent('machineStatusChange', { 'machineId': 'machine-01' });
        var rule = defaults.getSampleRule({ parameters: [{ 'property': 'machineId', 'equivalence': '*' }] });
        
        var result1 = rule.generateKey(event1);
        var result2 = rule.generateKey(event2);

        assert.equal(result1, result2, 'Generated keys should be the same');
    });

    it("should generate different unique keys for one event applied to two different rules", () => { 
        var event = defaults.getSampleEvent('machineStatusChange', { 'machineId': 'machine-01' });
        var rule1 = defaults.getSampleRule({ ruleId: '1', parameters: [{ 'property': 'machineId', 'equivalence': '*' }] });
        var rule2 = defaults.getSampleRule({ ruleId: '2', parameters: [{ 'property': 'machineId', 'equivalence': '*' }] });
        
        var result1 = rule1.generateKey(event);
        var result2 = rule2.generateKey(event);

        assert.notEqual(result1, result2, 'Generated keys should be different');
    });

});