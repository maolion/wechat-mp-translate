import {
    GET_HISTORIES,
    TOGGLE_STARRED,
    DELETE_HISTORIES,
    PUSH_HISTORY,
    ADD_TRANSLATION,
    GET_STARREDS
} from '../action-type-map';

const EMPTY_LIST = [];
const PLAIN_OBJECT = {};

export default function(state, action = {}) {
    state = state || EMPTY_LIST;

    return (
        processMapping[action.type||'default'] || processMapping['default']
    )(state, action);
}


var processMapping = {
    [GET_HISTORIES]: (state, action) => {
        let histories = action.payload;
        let translationMapping = Object.assign({}, state.map);
        let starredUids = (state.starredUids || EMPTY_LIST).slice();
        let historyUids = [];

        for (let history of histories) {
            let uid = history.data.uid;

            translationMapping[uid] = {
                ...translationMapping[uid],
                ...history.data
            };

            if (history.data.starred && starredUids.indexOf(uid) === -1) {
                starredUids.push(uid);
            }

            historyUids.push(uid);
        }

        return {
            ...state,
            map: translationMapping,
            historyUids,
            starredUids
        };
    },

    [TOGGLE_STARRED]: (state, action) => {
        let data = action.payload || PLAIN_OBJECT;
        let uid = data.uid;
        let translationMapping = Object.assign({}, state.map);
        let starredUids = (state.starredUids || EMPTY_LIST).slice();
        let translation = Object.assign({}, translationMapping[uid]);

        translation.starred = data.starred;

        translationMapping[uid] = translation;

        if (!data.starred) {
            starredUids.splice(starredUids.indexOf(uid), 1);
        } else if (starredUids.indexOf(uid) === -1) {
            starredUids.push(uid);
        }

        return {
            ...state,
            starredUids,
            map: translationMapping
        };
    },

    [DELETE_HISTORIES]: (state, action) => {
        let uids = action.payload || EMPTY_LIST;
        let historyUids = (state.historyUids || EMPTY_LIST).slice();

        let n = 0;

        for (let i = 0, l = historyUids.length; i < l; i++) {
            let uid = historyUids[i];

            if (uids.indexOf(uid) === -1) {
                historyUids[n++] = uid;
            }
        }

        historyUids.length = n;

        return {
            ...state,
            historyUids
        }
    },

    [PUSH_HISTORY]: (state, action) => {
        let translation = action.payload || PLAIN_OBJECT;

        if (!translation.uid) {
            return state;
        }

        let uid = translation.uid;
        let translationMapping = Object.assign({}, state.map);
        let historyUids = (state.historyUids || EMPTY_LIST).slice();

        translationMapping[uid] = translation;

        historyUids.splice(historyUids.indexOf(uid), 1);
        historyUids.unshift(uid);

        return {
            ...state,
            map: translationMapping,
            historyUids
        };
    },

    [ADD_TRANSLATION]: (state, action) => {
        let translation = action.payload || PLAIN_OBJECT;

        if (!translation.uid) {
            return state;
        }

        let uid = translation.uid;
        let translationMapping = Object.assign({}, state.map);

        translationMapping[uid] = translation;

        return {
            ...state,
            map: translationMapping
        }
    },

    [GET_STARREDS]: (state, action) => {
        let starreds = action.payload;
        let translationMapping = Object.assign({}, state.map);
        let starredUids = (state.starredUids || EMPTY_LIST).slice();

        for (let starred of starreds) {
            let translation = starred.data;
            let uid = translation.uid;

            translation.starred = true;

            translationMapping[uid] = {
                ...translationMapping[uid],
                ...translation
            };

            if (starredUids.indexOf(uid) === -1) {
                starredUids.push(uid);
            }
        }

        return {
            ...state,
            map: translationMapping,
            starredUids
        };
    },

    'default': (state) => {
        return state
    }
};
