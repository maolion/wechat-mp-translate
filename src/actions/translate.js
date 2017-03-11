import { Promise } from '../commons/kits/index';
import * as Storage from '../commons/kits/storage';


import apis from '../apis/apis';
import store from '../store';


import {
    GET_HISTORIES,
    TOGGLE_STARRED,
    DELETE_HISTORIES
} from '../action-type-map';


/**
 * 获取查询的历史列表
 */
export function getHistories() {
    return apis.translate.getHistories()
        .then(res => {
            let histories = res.data || [];

            histories.sort((a, b) => a.date > b.date ? 1 : -1);

            store.dispatch({
                type: GET_HISTORIES,
                payload: histories
            });

            return histories;
        });
}

export function toggleStarred(uid, starred) {
    return apis.translate.toggleStarred(uid, starred)
        .then(() => {
            store.dispatch({
                type: TOGGLE_STARRED,
                payload: {
                    uid,
                    starred
                }
            });
        });
}

export function deleteHistories(uids) {
    return apis.translate.deleteHistories(uids)
        .then(() => {
            store.dispatch({
                type: DELETE_HISTORIES,
                payload: uids
            });
        });
}

