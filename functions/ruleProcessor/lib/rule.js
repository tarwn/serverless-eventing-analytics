'use strict';

class Rule { 
    constructor(rawData) { 
        this.clientId = rawData.clientId;
        this.ruleId = rawData.ruleId;
        if (rawData.parameters) {
            this.parameters = rawData.parameters.map((p) => new RuleParameter(p));
        }
        else { 
            this.parameters = [];
        }
    }

    appliesTo(event) { 
        return this.parameters.length > 0 &&
                this.parameters.reduce((result, p) => result && p.appliesTo(event), true);
    }

    generateKey(event) { 
        var eventSpecificPortion = this.parameters.map((p) => p.generateKey(event)).join('-');
        return `${this.clientId}/rules/${this.ruleId}/${eventSpecificPortion}`;
    }

    meetsConditionsFor(result) { 
        // TODO: add real condition logic
        //  RuleCondition
        //      conditionType: PropertyChangeCountOverTime
        //      property: (name)
        //      count: (count)
        return false;
    }
}

class RuleParameter { 
    constructor(rawData) { 
        this.property = rawData.property;
        this.equivalence = rawData.equivalence;
    }

    appliesTo(event) { 
        return event[this.property] != null && (this.equivalence === '*' || event[this.property] === this.equivalence);
    }

    generateKey(event) { 
        return event[this.property];
    }
}

module.exports = Rule;