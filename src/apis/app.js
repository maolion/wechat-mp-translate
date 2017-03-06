import fetch, { get, post, patch, put, del } from './fetch';
import * as Storage from '../commons/kits/storage';

export function login(code) {
    return fetch('/api/login', {
        method: 'POST',
        data: {
            code
        }
    })
        .then(res => {
            // 缓存 sessionid 到 本地 storage
            Storage.set('session_id', res.data.sessionid);
            return res.data.sessionid;
        });

}

export function logout() {
    return del('/api/logout');
}

export function auth(sessionid) {
    return post('/api/auth', {
        sessionid
    });
}
