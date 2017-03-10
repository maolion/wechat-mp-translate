var Path = require("path");
var Mock = require("mockjs");
var server = require("./server");
var Translate = require('./translate');
var Constants = require('./constants');

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
    res.json(new Response(Constants.LANGS));
});


// 模拟数据生成
// var task = [
//     ['hello', 'en', 'zh'],
//     ['world', 'en', 'zh'],
//     ['你好', 'zh', 'en'],
//     ['世界', 'zh', 'en'],
//     ['from', 'en', 'zh'],
//     ['mini', 'en', 'zh'],
//     ['program', 'en', 'zh']
// ]
// var rets = [];
// next();

// function next() {
//     if (!task.length) {
//         console.log(JSON.stringify(rets, null, 2));
//         return;
//     }

//     Translate.query.apply(null, task.shift())
//         .then(ret => {
//             rets.push({
//                 date: Date.now(),
//                 data: ret
//             });

//             next();
//         })
// }
server.get('/api/histories', function(req, res) {
    res.json(new Response(
        require('./data/histories.json')
    ));
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

