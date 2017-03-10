import fetch, { get, post, patch, put, del } from './fetch';
import * as Storage from '../commons/kits/storage';

export function getHistories(code) {
    return get("/api/histories");
}

