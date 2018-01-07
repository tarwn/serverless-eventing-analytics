'use strict';

const assert = require('chai').assert;
const defaults = require("../defaults");
const results = require(process.cwd() + '/functions/ruleProcessor/lib/results');

describe("applyLocalResultToStoredResult", () => { 

    it("should combined the events and store the result", () => { 
        var initialResult = defaults.getSampleResult([defaults.getSampleEvent('unit-test'), defaults.getSampleEvent('unit-test')]);
        var secondResult = defaults.getSampleResult([defaults.getSampleEvent('unit-test')]);
        results.saveResult(initialResult);

        var combinedResult = results.applyLocalResultToStoredResult(secondResult);

        assert.equal(combinedResult.uniqueResultKey, initialResult.uniqueResultKey, "Unique Result Key has not changed");
        assert.equal(combinedResult.clientId, initialResult.clientId, "Client Id has not changed");
        assert.equal(combinedResult.ruleId, initialResult.ruleId, "Rule Id has not changed");
        assert.lengthOf(combinedResult.events, 3, "Includes all events");
        var storedResult = results.getResult(initialResult.uniqueResultKey);
        assert.deepEqual(combinedResult, storedResult, "Combined result was stored");
    });

});