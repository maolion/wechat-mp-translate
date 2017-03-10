import { Promise } from '../commons/kits/index';
import * as Storage from '../commons/kits/storage';


import apis from '../apis/apis';
import store from '../store';


import {
    GET_LANGS,
    GET_HISTORIES
} from '../action-type-map';

/**
 * 获取支持的语言列表
 */
export function getLangs() {
    return apis.common.getLangs()
        .then(res => {
            let langs = res.data || [];
            let ret = { mapping: {}, texts: [] };

            for (let lang of langs) {
                ret.mapping[lang.key] = lang.text;
                ret.mapping[lang.text] = lang.key;
                ret.texts.push(lang.text);
            }

            store.dispatch({
                type: GET_LANGS,
                payload: ret
            });

            return ret;
        });
}
