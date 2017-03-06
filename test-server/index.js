var Path = require("path");
var express = require("express");

var Constants = require("./constants.js");
var server = require("./server.js");

require('./apis.js');

var port = Constants.PORT;

server.use('/', express.static(Path.join(__dirname, 'statics')));

server.listen(port, function() {
    console.log('server started at http://location:' + port);
});