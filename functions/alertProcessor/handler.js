module.exports.streamProcessor = (event, context, callback) => {
    event.Records.forEach((record) => {
        const payload = new Buffer(record.kinesis.data, 'base64').toString('ascii');
        console.log("Received an alert: " + payload);
    });
    callback(null, `Successfully processed ${event.Records.length} alerts.`);
};