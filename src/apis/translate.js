import fetch, { get, post, patch, put, del } from './fetch';
import * as Storage from '../commons/kits/storage';

export function getHistories() {
    return get("/api/histories");
}

export function toggleStarred(uid, starred) {
    return patch('/api/toggle-starred', { uid, starred });
}

export function deleteHistories(uids) {
    return del('/api/histories', { uids });
}
