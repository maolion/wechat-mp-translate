var Path = require("path");
var Mock = require("mockjs");
var server = require("./server");
var Constants = require('./constants.js');

var HOST = 'http://localhost:' + Constants.PORT ;

server.post('/api/auth', function(req, res) {
    if (1 || Math.floor(Math.random() * 100) % 2) {
        res.json(new ResponseError(403, 'session id expired'));
    } else {
        res.json(new Response(null));
    }
});

server.post('/api/login', function(req, res) {
    if (0 && Math.floor(Math.random() * 100) % 2) {
        res.json(new ResponseError(403, 'login failed'));
    } else {
        res.json(new Response({
            sessionid: 'test server 3rd session id'
        }));
    }
});

///////

function Response(data) {
    this.meta = {
        code: 0,
        msg: ''
    };
    this.data = data;
}

function ResponseError(code, message) {
    this.meta = {
        code: code,
        msg: message
    };
    this.data = null;
}