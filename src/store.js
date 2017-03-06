import { createStore, compose, applyMiddleware } from './commons/kits/third-party/redux/redux';
import reducers from './reducers/reducers';

let enhancers = [
    applyMiddleware(
        logger
    )
];

const store = createStore(
    reducers,
    {},
    enhancers.length ? compose.apply(null, enhancers) : undefined
);

export default store;


function logger (api) {
    return next => action => {
        let result;
        console.log('action: ', action, 'state:', (result = next(action), api.getState()));
        return result
    };
}
