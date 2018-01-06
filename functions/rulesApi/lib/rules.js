var response = require('../response');

module.exports.getAll = (event, callback) => {
    callback(null, response.create(200, {
        result: []
    }));
};

module.exports.upsert = (event, callback) => {
    callback(null, response.create(200, {
        result: {}
    }));
};


