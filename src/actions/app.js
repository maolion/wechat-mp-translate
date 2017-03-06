import { Promise } from '../commons/kits/index';
import * as Storage from '../commons/kits/storage';

import apis from '../apis/apis';
import store from '../store';

import {
    LOGIN,
    GET_USER_INFO
} from '../action-type-map';

export function login() {
    return new Promise((resolve, reject) => {
        wx.login({
            success: res => {
                if (res.code) {
                    resolve(res.code);
                } else {
                    reject();
                }
            },
            fail: reject
        });
    })
        .then(code => {

            // 登录成功之后 需要用code 去服务器端换 3rd_session
            // 在这之前 会先从 storage 取之前创建的3rd_session
            // 如果有并且，通过服务器的验证，则不在重复创建，直接复用

            return Storage.get('session_id')
                .then(sessionId => {
                    if (!sessionId) {
                        throw '';
                    }

                    // 把旧的sessionId提交给服务器做一次验证
                    return apis.app.auth(sessionId)
                        .then(res => sessionId)
                })
                .fail(reason => {
                    // 拿code换3rd_session
                    return apis.app.login(code);
                });

        })
        .then(sessionId => {
            store.dispatch({
                type: LOGIN,
                payload: {
                    sessionId
                }
            });
        });
}

export function getUserInfo() {
    return new Promise((resolve, reject) => {
        wx.getUserInfo({
            success: userInfo => {
                store.dispatch({
                    type: GET_USER_INFO,
                    payload: userInfo
                });
                resolve(userInfo);
            },
            fail: reject
        });
    });
}
