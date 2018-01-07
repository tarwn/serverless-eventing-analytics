'use strict';

class Result { 
    constructor(uniqueResultKey, clientId, ruleId, initialEvents) { 
        this.uniqueResultKey = uniqueResultKey;
        this.ruleId = ruleId;
        this.clientId = clientId;
        this.events = [];

        if (initialEvents) {
            initialEvents.forEach((e) => this.addEvent(e));
        }    
    }

    addEvent(event) { 
        this.events.push(event);
    }

    mergeResult(result) { 
        const combinedResult = new Result(this.uniqueResultKey, this.clientId, this.ruleId, this.events);
        result.events.forEach((e) => {
            combinedResult.addEvent(e);
        });
        return combinedResult;
    }
}

module.exports = Result;