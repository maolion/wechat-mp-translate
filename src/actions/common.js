import { Promise } from '../commons/kits/index';
import * as Storage from '../commons/kits/storage';


import apis from '../apis/apis';
import store from '../store';


import {
    GET_LANGS
} from '../action-type-map';

export function getLangs() {
    return apis.common.getLangs()
        .then(res => {
            let langs = res.data || [];
            store.dispatch({
                type: GET_LANGS,
                payload: langs
            });

            return langs;
        });
}
