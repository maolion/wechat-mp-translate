import fetch, { get, post, patch, put, del } from './fetch';
import * as Storage from '../commons/kits/storage';

export function getLangs(code) {
    return get("/api/langs");
}
