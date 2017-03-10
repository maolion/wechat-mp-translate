import {
    GET_LANGS,
    GET_HISTORIES
} from '../action-type-map';

const PLAIN_OBJECT = {};

export default function(state, action = {}) {
    state = state || PLAIN_OBJECT;

    switch (action.type) {
        case GET_LANGS:
            state = {
                ...state,
                langs: action.payload
            };
            break;
        case GET_HISTORIES:
            state = {
                ...state,
                histories: action.payload
            };
            break;
    }

    return state;
}
