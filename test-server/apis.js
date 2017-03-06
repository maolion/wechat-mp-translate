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

server.get('/api/langs', function(req, res) {
    res.json(new Response([
        '中文 (简体)',
        '中文 (繁体)',
        '英文',
        '泰宁话',
        '闽南话',
        '四川话',
        '东北话',
        '上海话',
        '日文',
        '韩文',
        '俄文'
    ]));
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
