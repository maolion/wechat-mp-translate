import {
    LOGIN,
    GET_USER_INFO
} from '../action-type-map';

const PLAIN_OBJECT = {};

export default function(state, action = {}) {
    state = state || PLAIN_OBJECT;

    switch (action.type) {
        case LOGIN:
            return {
                ...state,
                sessionId: action.payload.sessionId
            };

        case GET_USER_INFO:
            return {
                ...state,
                userInfo: action.payload.userInfo,
                userSignature: action.payload.signature
            };
    }

    return state;
}
