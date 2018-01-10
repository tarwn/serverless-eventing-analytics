'use strict';

const AWS = require('aws-sdk');
var Result = require("./result");


const docClient = new AWS.DynamoDB.DocumentClient({ 
    endpoint: `${process.env.DYNAMODB_HOST}:${process.env.DYNAMODB_PORT}`,
    region: `${process.env.DYNAMODB_REGION}`
 });

module.exports.applyLocalResultToStoredResult = (localResult, rule) => { 
    return module.exports.getResult(localResult.uniqueResultKey)
        .then((remoteResult) => {
            if(remoteResult !== null){
                return remoteResult.mergeResult(localResult);
                // TODO: truncate events based on window for rule
            }
            else{
                return localResult;
            }
        })
        .then((result) => {
            return module.exports.saveResult(result)
                .then((_unusedResponse) => {
                    return result;
                });
        });
};

module.exports.getResult = (uniqueResultKey) => {
    const params = {
        TableName: process.env.DYNAMODB_TABLE_NAME_RESULTS,
        Key: {
            'unique_result_key': uniqueResultKey
        }
    };

    console.log(`DynamoDB - Retrieving ${uniqueResultKey}`);
    return docClient.get(params).promise()
        .then((rawResult) => {
            if(rawResult["Item"]){
                const i = rawResult["Item"];
                console.log(`DynamoDB - Retrieving ${uniqueResultKey}: Success ${i.events.length} events`);
                return new Result(i.unique_result_key, i.client_id, i.rule_id, i.events);
            }
            else{
                console.log(`DynamoDB - Retrieving ${uniqueResultKey}: Does not exist`);
                return null;
            }
        });
};

module.exports.saveResult = (result) => { 
    const params = {
        TableName: process.env.DYNAMODB_TABLE_NAME_RESULTS,
        Key: {
            'unique_result_key': result.uniqueResultKey
        },
        UpdateExpression: "set client_id = :clientId, rule_id = :ruleId, events = :events, updated = :updated",
//        ConditionExpression: "",    // future note if needed: https://forums.aws.amazon.com/thread.jspa?threadID=239939
        ExpressionAttributeValues: {
            ':clientId': result.clientId,
            ':ruleId': result.ruleId,
            ':events': result.events,
            ':updated': new Date().toISOString()
        },
        ReturnValues:"UPDATED_NEW"
    };

    console.log(`DynamoDB - Storing ${result.uniqueResultKey}`);
    return docClient.update(params).promise()
        .then((_unusedResponse) => {
            console.log(`DynamoDB - Storing ${result.uniqueResultKey}: Success`);
            // TODO do something with update response
            return _unusedResponse;
        });
};
