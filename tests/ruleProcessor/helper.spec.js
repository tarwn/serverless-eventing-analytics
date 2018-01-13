const assert = require('chai').assert;
const defaults = require("./defaults");
const helper = require(process.cwd() + '/functions/ruleProcessor/helper');
const Rule = require(process.cwd() + '/functions/ruleProcessor/lib/rule');

describe('groupEventsByClient', () => { 

    it('should group events for the same client into one set', () => { 
        var events = [
            defaults.getSampleEvent('test', { clientId: 'client-00' }),
            defaults.getSampleEvent('test', { clientId: 'client-00' }),
            defaults.getSampleEvent('test', { clientId: 'client-00' })
        ];

        var grouped = helper.groupEventsByClient(events);
        assert.lengthOf(grouped, 1, 'Events have all been grouped in one client');
        assert.equal(grouped[0].clientId, 'client-00', 'Events represent the expected client id');
    });
    
    it('should group events for different clients in different sets', () => { 
        var events = [
            defaults.getSampleEvent('test', { clientId: 'client-00' }),
            defaults.getSampleEvent('test', { clientId: 'client-01' }),
            defaults.getSampleEvent('test', { clientId: 'client-02' })
        ];

        var grouped = helper.groupEventsByClient(events);
        assert.lengthOf(grouped, 3, 'Events have all been grouped in one client');
        var counts = grouped.map((g) => g.events.length);
        assert.deepEqual(counts, [1, 1, 1], 'One event stored for each client');
    });
        
    it('should put unrecognized client events in a separate collection', () => { 
        var events = [
            defaults.getSampleEvent('test', { clientId: undefined }),
            defaults.getSampleEvent('test', { clientId: undefined }),
            defaults.getSampleEvent('test', { clientId: undefined })
        ];

        var grouped = helper.groupEventsByClient(events);
        assert.lengthOf(grouped, 1, 'Events have all been grouped in one client');
        assert.isUndefined(grouped[0].clientId, 'Events have been stored with an undefined clientId');
    });
});

describe("applyRules", () => { 

    it("should only include events that rule applied to", () => {
        const clientRules = [
            defaults.getSampleRule({ where: [{ 'property': 'machineId', 'equals': 'machine-01' }] })
        ];
        const clientEventsGroup = {
            events: [
                defaults.getSampleEvent('machineStatusChange', { 'machineId': 'machine-01' }),
                defaults.getSampleEvent('machineStatusChange', { 'machineId': 'machine-02' })
            ]
        };

        var results = helper.applyRules(clientRules, clientEventsGroup);

        var rulesApplied = Object.keys(results);
        assert.lengthOf(rulesApplied, 1, "Should have 1 rule entry");
        assert.lengthOf(results[rulesApplied[0]].events, 1, "Should have 1 event in rule entry");
    });

    it("should add event to every rule that applies", () => {
        const clientRules = [
            defaults.getSampleRule({ ruleId: 'rule-00', where: [{ 'property': 'machineId', 'equals': '*' }] }),
            defaults.getSampleRule({ ruleId: 'rule-01', where: [{ 'property': 'machineId', 'equals': '*' }] }),
            defaults.getSampleRule({ ruleId: 'rule-02', where: [{ 'property': 'machineId', 'equals': '*' }] })
        ];
        const clientEventsGroup = {
            events: [
                defaults.getSampleEvent('machineStatusChange', { 'machineId': 'machine-01', 'uniqueId': '123' })
            ]
        };

        var results = helper.applyRules(clientRules, clientEventsGroup);

        var rulesApplied = Object.keys(results);
        assert.lengthOf(rulesApplied, 3, "Should have 3 rule entries");
        const lengthOfEachRuleResult = rulesApplied.map((r) => results[r].events.length);
        assert.deepEqual(lengthOfEachRuleResult, [1, 1, 1], "1 event present for each returned rule result");
        const idOfEachRuleResultsEvent = rulesApplied.map((r) => results[r].events[0].uniqueId);
        assert.deepEqual(idOfEachRuleResultsEvent, ['123', '123', '123'], "Same event present for each rule");
    });

    it("should only return rules that were applied", () => {
        const clientRules = [
            defaults.getSampleRule({ where: [{ 'property': 'machineId', 'equals': '*' }] }),
            defaults.getSampleRule({ where: [{ 'property': 'somethingElse', 'equals': '*' }] })
        ];
        const clientEventsGroup = {
            events: [
                defaults.getSampleEvent('machineStatusChange', { 'machineId': 'machine-01' })
            ]
        };

        var results = helper.applyRules(clientRules, clientEventsGroup);

        var rulesApplied = Object.keys(results);
        assert.lengthOf(rulesApplied, 1, "Should have 1 rule entry");
    });
});
