'use strict';

const assert = require('chai').assert;
const defaults = require("../defaults");
const Rule = require(process.cwd() + '/functions/ruleProcessor/lib/rule');

describe("appliesTo", () => { 

    it("returns true when the event satisifies the rule's `where`", () => { 
        var event = defaults.getSampleEvent('machineStatusChange', { 'machineId': 'machine-00' });
        var rule = defaults.getSampleRule({ where: [{ 'property': 'eventType', 'equals': 'machineStatusChange' }] });

        var result = rule.appliesTo(event);

        assert.isTrue(result);
    });

    it("returns false when the event does not satisfy the rule's `where`", () => { 
        var event = defaults.getSampleEvent('machineStatusChange', { 'machineId': 'machine-00' });
        var rule = defaults.getSampleRule({ where: [{ 'property': 'eventType', 'equals': 'somethingElse' }] });

        var result = rule.appliesTo(event);

        assert.isFalse(result);
    });
    
    it("returns false when the rule has no `where` to match on", () => { 
        var event = defaults.getSampleEvent('machineStatusChange', { 'machineId': 'machine-00' });
        var rule = defaults.getSampleRule({ where: [] });

        var result = rule.appliesTo(event);

        assert.isFalse(result);
    });

    it("returns true when the event satisifies the all of the rule's `where`", () => { 
        var event = defaults.getSampleEvent('machineStatusChange', { 'machineId': 'machine-00' });
        var rule = defaults.getSampleRule({
            where: [
                { 'property': 'eventType', 'equals': 'machineStatusChange' },
                { 'property': 'machineId', 'equals': 'machine-00' }
            ]
        });

        var result = rule.appliesTo(event);

        assert.isTrue(result);
    });

    it("returns false when the event does not satisfy all of the rule's `where`", () => { 
        var event = defaults.getSampleEvent('machineStatusChange', { 'machineId': 'machine-00' });
        var rule = defaults.getSampleRule({
            where: [
                { 'property': 'eventType', 'equals': 'somethingElse' },
                { 'property': 'machineId', 'equals': 'machine-00' }
            ]
        });

        var result = rule.appliesTo(event);

        assert.isFalse(result);
    });
    
    it("returns true when the event satisifies the '*' for a parameter equals", () => { 
        var event = defaults.getSampleEvent('machineStatusChange', { 'machineId': 'machine-00' });
        var rule = defaults.getSampleRule({ where: [{ 'property': 'machineId', 'equals': '*' }] });

        var result = rule.appliesTo(event);

        assert.isTrue(result);
    });

    it("returns false when the event does not satisfy the '*' for a parameter equals (does not have property)", () => { 
        var event = defaults.getSampleEvent('machineStatusChange', { 'machineId': 'machine-00' });
        var rule = defaults.getSampleRule({ where: [{ 'property': 'aNonexistentFieldForEvent', 'equals': '*' }] });

        var result = rule.appliesTo(event);

        assert.isFalse(result);
    });
});

describe("generateKey", () => { 
    
    it("should generate a unique key for the rule and 2 events that have different parameter equals", () => { 
        var event1 = defaults.getSampleEvent('machineStatusChange', { 'machineId': 'machine-01' });
        var event2 = defaults.getSampleEvent('machineStatusChange', { 'machineId': 'machine-02' });
        var rule = defaults.getSampleRule({ where: [{ 'property': 'machineId', 'equals': '*' }] });
        
        var result1 = rule.generateKey(event1);
        var result2 = rule.generateKey(event2);

        assert.notEqual(result1, result2, 'Generated keys are not the same');
    });

    it("should generate the same unique key for a rule and 2 events that have the same parameter equals", () => { 
        var event1 = defaults.getSampleEvent('machineStatusChange', { 'machineId': 'machine-01' });
        var event2 = defaults.getSampleEvent('machineStatusChange', { 'machineId': 'machine-01' });
        var rule = defaults.getSampleRule({ where: [{ 'property': 'machineId', 'equals': '*' }] });
        
        var result1 = rule.generateKey(event1);
        var result2 = rule.generateKey(event2);

        assert.equal(result1, result2, 'Generated keys should be the same');
    });

    it("should generate different unique keys for one event applied to two different rules", () => { 
        var event = defaults.getSampleEvent('machineStatusChange', { 'machineId': 'machine-01' });
        var rule1 = defaults.getSampleRule({ ruleId: '1', where: [{ 'property': 'machineId', 'equals': '*' }] });
        var rule2 = defaults.getSampleRule({ ruleId: '2', where: [{ 'property': 'machineId', 'equals': '*' }] });
        
        var result1 = rule1.generateKey(event);
        var result2 = rule2.generateKey(event);

        assert.notEqual(result1, result2, 'Generated keys should be different');
    });

});

describe("meetsConditionsFor", () => { 

    it("should return true when `any`, `latest` conditions are met by latest event and no partitioning in use", () => { 
        var event1 = defaults.getSampleEvent('machineStatusChange', { 'machineId': 'machine-01', 'status': 'starting' });
        var event2 = defaults.getSampleEvent('machineStatusChange', { 'machineId': 'machine-02', 'status': 'stopping' });
        var rule = defaults.getSampleRule({
            where: [{ 'property': 'machineId', 'equals': '*' }],
            partition: [],
            evaluate: {
                type: 'any',
                having: {
                    calc: 'latest',
                    property: 'status',
                    equals: 'stopping'
                }
            }
        });
        var sampleResult = defaults.getSampleResult([event1, event2]);

        var result = rule.meetsConditionsFor(sampleResult);

        assert.isTrue(result, "Rule applies to result");
    });

    it("should return true when `any`, `latest` conditions are met by latest event for one of two partitions", () => { 
        var event1 = defaults.getSampleEvent('machineStatusChange', { 'machineId': 'machine-01', 'status': 'starting' });
        var event2 = defaults.getSampleEvent('machineStatusChange', { 'machineId': 'machine-02', 'status': 'stopping' });
        var rule = defaults.getSampleRule({
            where: [{ 'property': 'machineId', 'equals': '*' }],
            partition: ['machineId'],
            evaluate: {
                type: 'any',
                having: {
                    calc: 'latest',
                    property: 'status',
                    equals: 'stopping'
                }
            }
        });
        var sampleResult = defaults.getSampleResult([event1, event2]);

        var result = rule.meetsConditionsFor(sampleResult);

        assert.isTrue(result, "Rule applies to result");
    });

    it("should return true when `all`, `latest` conditions are met by latest event and no partitioning in use", () => { 
        var event1 = defaults.getSampleEvent('machineStatusChange', { 'machineId': 'machine-01', 'status': 'starting' });
        var event2 = defaults.getSampleEvent('machineStatusChange', { 'machineId': 'machine-02', 'status': 'stopping' });
        var rule = defaults.getSampleRule({
            where: [{ 'property': 'machineId', 'equals': '*' }],
            partition: [],
            evaluate: {
                type: 'all',
                having: {
                    calc: 'latest',
                    property: 'status',
                    equals: 'stopping'
                }
            }
        });
        var sampleResult = defaults.getSampleResult([event1, event2]);

        var result = rule.meetsConditionsFor(sampleResult);

        assert.isTrue(result, "Rule applies to result");
    });

    it("should return false when `all`, `latest` conditions are met by latest event in only one of two partitions", () => { 
        var event1 = defaults.getSampleEvent('machineStatusChange', { 'machineId': 'machine-01', 'status': 'starting' });
        var event2 = defaults.getSampleEvent('machineStatusChange', { 'machineId': 'machine-02', 'status': 'stopping' });
        var rule = defaults.getSampleRule({
            where: [{ 'property': 'machineId', 'equals': '*' }],
            partition: ['machineId'],
            evaluate: {
                type: 'all',
                having: {
                    calc: 'latest',
                    property: 'status',
                    equals: 'stopping'
                }
            }
        });
        var sampleResult = defaults.getSampleResult([event1, event2]);

        var result = rule.meetsConditionsFor(sampleResult);

        assert.isFalse(result, "Rule applies to result");
    });
});

describe("getAlertFor", () => { 

    it("should produce an alert with event details", () => { 
        var event1 = defaults.getSampleEvent('machineStatusChange', { 'machineId': 'machine-01', 'status': 'stopping' });
        var event2 = defaults.getSampleEvent('machineStatusChange', { 'machineId': 'machine-02', 'status': 'stopping' });
        var rule = defaults.getSampleRule({
            ruleId: 'rule-id-0',
            where: [{ 'property': 'machineId', 'equals': '*' }],
            partition: [],
            evaluate: {
                type: 'any',
                having: {
                    calc: 'latest',
                    property: 'status',
                    equals: 'stopping'
                }
            }
        });
        var sampleResult = defaults.getSampleResult([event1, event2]);
        sampleResult.ruleId = rule.ruleId;

        var result = rule.getAlertFor(sampleResult);

        assert.isNotNull(result, "Alert is not null");
        assert.equal(result.ruleId, rule.ruleId, "Alert reflects rule id");
        assert.isNotNull(result.event, "Alert includes an event");
        assert.equal(result.event.machineId, event2.machineId, "Alert reflects latest event");
    });

});