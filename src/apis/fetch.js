import { Promise } from '../commons/kits/index';
import store from  '../store';
import config from '../config';

const API_HOST = config.api_host;

if (!API_HOST) {
    throw new Error('need assign a value to /config.js "api_host" field');
}

const DEFAULT_HEADER = {
    'Content-Type': 'application/json; charset=utf-8'
}

export default function fetch(url, options) {
    let targetURL = resolveURL(url);
    console.log('request: ', targetURL);

    return new Promise((resolve, reject) => {
        wx.request({
            url: targetURL,
            data: options.data,
            method: options.method,
            header: Object.assign({}, DEFAULT_HEADER, options.header),
            success(res) {
                if (res.statusCode != 200) {
                    reject(res.errMsg);
                    return;
                }

                if (res.data && res.data.meta && res.data.meta.code) {
                    reject(res.data.meta.msg)
                    return;
                }

                console.log('request success: ', targetURL);
                resolve(res.data);
            },
            fail: reject
        });
    })
        .fail(reason => {
            console.error('request failed: ', targetURL);
            throw reason;
        });
}

export function get(url, data) {
    return fetch(url, {
        method: "GET",
        data: bindSessionId(data)
    });
}

export function post(url, data) {
    return fetch(url, {
        method: "POST",
        data: bindSessionId(data)
    });
}

export function del(url, data) {
    return fetch(url, {
        method: "DELETE",
        data: bindSessionId(data)
    });
}

export function patch(url, data) {
    return fetch(url, {
        method: "PATCH",
        data: bindSessionId(data)
    });
}

export function put(url, data) {
    return fetch(url, {
        method: "PUT",
        data: bindSessionId(data)
    });
}

function bindSessionId(data) {
    const sessionId = store.getState().app.sessionId;
    return Object.assign({ sessionId }, data)
}


function resolveURL(url) {
    if (url.charAt(0) == '/') {
        return API_HOST + url;
    } else if (/^https?:\/\//.test(url)) {
        return url;
    } else {
        return API_HOST + '/' + url;
    }
}
