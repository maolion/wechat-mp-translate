import { Promise } from '../commons/kits/index';
import * as Storage from '../commons/kits/storage';


import apis from '../apis/apis';
import store from '../store';


import {
    GET_HISTORIES,
    TOGGLE_STARRED,
    DELETE_HISTORIES,
    PUSH_HISTORY,
    ADD_TRANSLATION
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
    let translationMapping = (store.getState().translate || {}).map || {};

    if (!translationMapping[uid]) {
        return Promise.void;
    }

    let translation = {
        ...translationMapping[uid],
        starred
    };

    return apis.translate.toggleStarred(translation)
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

export function pushHistory(translation) {
    return apis.translate.pushHistory(translation)
        .handle(() => {
            store.dispatch({
                type: PUSH_HISTORY,
                payload: translation
            });
        });
}

export function getTranslation(word, from, to) {
    return apis.translate.getTranslation(word, from, to)
        .then(res => {
            let translation = res.data;

            store.dispatch({
                type: ADD_TRANSLATION,
                payload: translation
            });

            return translation;
        });
}
