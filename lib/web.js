const express = require('express');

module.exports = function() {
    const app = express();
    
    app.use(express.static('static'));

    app.get('/', function (req, res) {
        res.sendfile("index.html", {root: './static'});
    });

    return app;
};