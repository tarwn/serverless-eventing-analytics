'use strict';

//const AWS = require('aws-sdk');
//const docClient = new AWS.DynamoDB.DocumentClient();

module.exports.applyLocalResultToStoredResult = (localResult, rule) => { 
    const remoteResult = module.exports.getResult(localResult.uniqueResultKey);
    const combinedResult = remoteResult.mergeResult(localResult);

    // TODO: truncate events based on window for rule

    module.exports.saveResult(combinedResult);
    return combinedResult;
};

module.exports.getResult = (uniqueResultKey) => {
    return temporaryStorage[uniqueResultKey];
};

module.exports.saveResult = (result) => { 
    temporaryStorage[result.uniqueResultKey] = result;

    //TODO: DynamoDB + Dynalite
    // const params = {
    //     TableName: env.process.DYNAMODB_TABLE_NAME_RESULTS,
    //     Key: {
    //         'uniqueResultsKey': result.uniqueResultKey
    //     },
    //     UpdateExpression: "set clientId = :clientId, ruleId = :ruleId, events = :events, updated = :updated",
    //     ConditionExpression: "",    // future note if needed: https://forums.aws.amazon.com/thread.jspa?threadID=239939
    //     ExpressionAttributeValues: {
    //         'clientId': result.clientId,
    //         'ruleId': result.ruleId,
    //         'events': results.events,
    //         'updated': new Date()
    //     },
    //     ReturnValues:"UPDATED_NEW"
    // };

    // console.log("Attempting a conditional update...");
    // return docClient.update(params).promise();
};

// this is in memory, works temporarily for offline dev access by ruleProcessor only
const temporaryStorage = {};