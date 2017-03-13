import fetch, { get, post, patch, put, del } from './fetch';
import * as Storage from '../commons/kits/storage';

export function getHistories() {
    return get("/api/histories");
}

export function toggleStarred(translation) {
    return patch('/api/starred', { translation });
}


export function pushHistory(translation) {
    return post('/api/history', { translation });
}

export function deleteHistories(uids) {
    return del('/api/histories', { uids });
}

export function getTranslation(word, from, to) {
    return get('/api/translation', { word, from, to });
}
