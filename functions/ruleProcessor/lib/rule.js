'use strict';

var Alert = require('./alert');

class Rule { 
    constructor(rawData) { 
        this.clientId = rawData.clientId;
        this.ruleId = rawData.ruleId;
        this.evaluate = new EvaluateCondition(rawData.evaluate);
        if (rawData.where) {
            this.where = rawData.where.map((p) => new RuleParameter(p));
        }
        else { 
            this.where = [];
        }
        if (rawData.partition) {
            this.partition = rawData.partition.map(p => p);
        }
        else { 
            this.partition = [];
        }
    }

    appliesTo(event) { 
        return this.where.length > 0 &&
                this.where.reduce((result, p) => result && p.appliesTo(event), true);
    }

    generateKey(event) { 
        var eventSpecificPortion = this.where.map((p) => p.generateKey(event)).join('-');
        return `${this.clientId}/rules/${this.ruleId}/${eventSpecificPortion}`;
    }

    meetsConditionsFor(result) {
        // build event streams for each partition
        const streams = {};
        result.events.forEach((e) => {
            const partition = this._getPartition(e);
            if (!streams[partition]) {
                streams[partition] = [];
            }
            streams[partition].push(e);
        });

        // evaluate each stream
        if (this.evaluate.type === 'any') { 
            return Object.keys(streams).some((s) => { 
                const stream = streams[s];
                if (stream.length === 0) return false;

                if (this.evaluate.having.calc === 'latest' && this.evaluate.having.equals) {
                    return stream[stream.length - 1][this.evaluate.having.property] === this.evaluate.having.equals;
                }
                else { 
                    return false;
                }                    
            });
        }
        else if (this.evaluate.type === 'all') { 
            return Object.keys(streams).every((s) => { 
                const stream = streams[s];
                if (stream.length === 0) return false;

                if (this.evaluate.having.calc === 'latest' && this.evaluate.having.equals) {
                    return stream[stream.length - 1][this.evaluate.having.property] === this.evaluate.having.equals;
                }
                else { 
                    return false;
                }                    
            });
        }

        return false;
    }

    _getPartition(event) { 
        if (this.partition.length === 0) {
            return 'p';
        }
        else { 
            return this.partition.reduce((partitionKey, fieldName) => { 
                return `${partitionKey}:${event[fieldName]}`;
            }, 'p:');
        }
    }

    getAlertFor(result) {
        // skipping the more correct answer, but this should either:
        //  - go through partitions again and get relevant events by partition
        //  - get latest eventId (this alert was produced by scaning up to event X in the stream)

        return new Alert(result.clientId, result.ruleId, result.events[result.events.length - 1]);
    }
}

class RuleParameter { 
    constructor(rawData) { 
        this.property = rawData.property;
        this.equals = rawData.equals;
    }

    appliesTo(event) { 
        return event[this.property] != null && (this.equals === '*' || event[this.property] === this.equals);
    }

    generateKey(event) { 
        return event[this.property];
    }
}

class EvaluateCondition { 
    constructor(rawData) { 
        this.type = rawData.type;
        this.having = rawData.having;
    }


}

module.exports = Rule;