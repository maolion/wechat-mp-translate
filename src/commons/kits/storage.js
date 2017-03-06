import { Promise } from './third-party/thenfail/index';

export function getStorageInfo() {
    return new Promise((resolve, reject) => {
        wx.getStorageInfo({
            success(res) {
                resolve(res);
            },
            fail: reject
        });
    });
}

export function get(key) {
    return new Promise((resolve, reject) => {
        wx.getStorage({
            key,
            success(res) {
                resolve(res.data);
            },
            fail: reject
        });
    });
}

export function set(key, data) {
    return new Promise((resolve, reject) => {
        wx.setStorage({
            key,
            data,
            success() {
                resolve();
            },
            fail: reject
        });
    });
}


export function remove(key) {
    return new Promise((resolve, reject) => {
        wx.removeStorage({
            key,
            success() {
                resolve();
            },
            fail: reject
        });
    });
}

export function clearStorage() {
    return wx.clearStorage();
}
