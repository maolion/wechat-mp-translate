import {
    GET_HISTORIES
} from '../action-type-map';

const PLAIN_ARRAY = [];

export default function(state, action = {}) {
    state = state || PLAIN_ARRAY;

    switch (action.type) {
        case GET_HISTORIES:
            state = processGetHistoriesAction(state, action);
            break;
    }

    return state;
}


function processGetHistoriesAction(state, action) {
    let histories = action.payload;
    let translationMapping = Object.assign({}, state.map);
    let historyUids = [];

    for (let history of histories) {
        let uid = history.data.uid;

        translationMapping[uid] = {
            ...translationMapping[uid],
            ...history.data
        };

        historyUids.push(uid);
    }

    return {
        ...state,
        map: translationMapping,
        historyUids
    };
}
