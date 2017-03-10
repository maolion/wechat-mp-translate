import { Promise } from '../commons/kits/index';
import * as Storage from '../commons/kits/storage';


import apis from '../apis/apis';
import store from '../store';


import {
    GET_HISTORIES
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
