'use strict';

class EventGroup{
    constructor(clientId){
        this.clientId = clientId;
        this.events = [];
    }

    addEvent(event){
        this.events.push(event);
    }
}

module.exports = EventGroup;