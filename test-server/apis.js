var Path = require("path");
var Mock = require("mockjs");
var QueryString = require('querystring');
var fetch = require('node-fetch');
var macaddress = require('macaddress');

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

server.patch('/api/starred', function(req, res) {
    res.json(new Response(null));
});

server.post('/api/history', function(req, res) {
    res.json(new Response(null));
});

server.delete('/api/histories', function(req, res) {
    res.json(new Response(null));
});

server.get('/api/voice', function(req, res) {
    let tok = '';
    getBaiduOpenAPIAccessToken()
        .then(token => tok = token)
        .then(getMacAddress)
        .then(macaddress => {
            let text = req.query.text;
            let lang = req.query.lang;
            let url = Constants.BAIDU_YUYIN_API;
            let queryString = QueryString.stringify({
                tex: encodeURIComponent(text),
                lan: lang,
                ctp: 1,
                tok: tok,
                cuid: macaddress
            });

            return fetch(`${url}?${queryString}`)
                .then(res => {
                    if (res.headers.get('content-type').toLowerCase().indexOf('mp3') !== -1) {
                        return res.buffer();
                    } else {

                        return res.json()
                            .then(res => {
                                throw res;
                            });
                    }
                })
                .then(buffer => {
                    res.setHeader('Content-Type', 'audio/mp3')
                    res.send(buffer);
                });
        })
        .catch(reason => {
            res.status(500).send(JSON.stringify(reason));
        });
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

function getBaiduOpenAPIAccessToken() {
    if (getBaiduOpenAPIAccessToken._promise) {
        return getBaiduOpenAPIAccessToken._promise;
    }

    var url = Constants.BAIDU_OAUTH_TOKEN;
    var queryString = QueryString.stringify({
        grant_type: 'client_credentials',
        client_id: Constants.BAIDU_YUYIN_KEY,
        client_secret: Constants.BAIDU_YUYIN_SKEY
    });

    return getBaiduOpenAPIAccessToken._promise = fetch(`${url}?${queryString}`)
        .then(res => res.json())
        .then(res => res.access_token)
        .catch(reason => {
            getBaiduOpenAPIAccessToken._promise = null;
            throw reason;
        });
}

function getMacAddress() {
    return getMacAddress._promise = getMacAddress._promise || new Promise((resolve, reject) => {
        macaddress.one(function (err, macaddress) {
            if (err) {
                getMacAddress._promise = null;
                reject();
                return;
            }

            resolve(macaddress);
        });
    });
}
