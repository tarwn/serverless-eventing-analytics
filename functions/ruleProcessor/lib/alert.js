class Alert { 
    constructor(clientId, ruleId, event) { 
        this.clientId = clientId;
        this.ruleId = ruleId;
        this.event = event;
    }
}

module.exports = Alert;