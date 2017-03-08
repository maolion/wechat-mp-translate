var fetch = require('node-fetch');
var QueryString = require('querystring');
var Utils = require('./utils');
var Cache = require('./cache');
var Constants = require('./constants');

var routeMapping = {
    'en>zh': youdaoFanyi,
    'zh>en': youdaoFanyi,
    'default': baiduFanyi
};

exports.query = function query(word, from, to) {
    var route = `${from}>${to}`;
    var handler = routeMapping[route] || routeMapping['default'];
    var cacheKey = `${word}|${from}>${to}`;
    var ret = {
        source: {
            lang: from,
            content: word,
            phonetic: null
        },
        dest: null
    };
    console.log(`translate query: ${word}; ${from} > ${to}.`);

    return Cache.get(cacheKey)
        .then(res => res || handler(word, from, to))
        .then(res => {
            Cache.set(cacheKey, res);
            ret.dest = res;
            ret.source.phonetic = ret.dest.phonetic;
            ret.dest.phonetic = null;
            ret.dest.lang = to;

            return exports.getPhonetic(ret.dest.content, from)
                .then(phonetic => ret.dest.phonetic = phonetic)
                .catch(() => '')
        })
        .then(() => {
            console.log(`translate result: ${JSON.stringify(ret)}.`);
            return ret;
        });
};

exports.getPhonetic = function(word, lang) {
    let cacheKey = `${word}|${lang}`;

    return Cache.get(cacheKey)
        .then(ret => {
            if (!ret) {
                return new Promise((resolve, reject) => {
                    switch (lang) {
                        case 'zh':
                        case 'cht':
                        case 'en':
                             resolve(
                                youdaoFanyi(word)
                                    .then(ret => ret.phonetic)
                             );
                            break;
                        default:
                            resolve('');
                    }
                });
            } else {
                return ret;
            }
        })
        .then(ret => {
            Cache.set(cacheKey, ret);
            return ret;
        });
}

function youdaoFanyi(word) {
    var queryString = QueryString.stringify({
        keyfrom: Constants.YOUDAO_FANYI_API_KEYFROM,
        key: Constants.YOUDAO_FANYI_API_KEY,
        type: 'data',
        doctype: 'json',
        version: '1.1',
        q: word
    });
    var url = `${Constants.YOUDAO_FANYI_API}?${queryString}`;

    return fetch(url)
        .then(res => res.json())
        .then(res => {
            var ret = {
                content: res.translation && res.translation[0],
                phonetic: res.basic && res.basic.phonetic,
                explains: res.basic && res.basic.explains
            };

            return ret;
        });
}

function baiduFanyi(word, from, to) {
    var salt = Date.now().toString();
    var sign = Utils.md5(Constants.BAIDU_FANYI_API_APPID + word + salt + Constants.BAIDU_FANYI_API_KEY);
    var queryString = QueryString.stringify({
        from: from,
        to: to,
        appid: Constants.BAIDU_FANYI_API_APPID,
        salt: salt,
        sign: sign,
        q: word
    });

    var url = `${Constants.BAIDU_FANYI_API}?${queryString}`;
    var ret = {};

    return fetch(url)
        .then(res => res.json())
        .then(res => {
            if (parseInt(res.error_code)) {
                throw res.error_msg;
            }

            ret.content = res.trans_result[0].dst;
            ret.explains = null;

            return exports.getPhonetic(ret.content, to)
                .then(phonetic => ret.phonetic = phonetic)
                .catch(e => null);
        })
        .then(() => ret);
}
