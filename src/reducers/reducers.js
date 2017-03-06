import { combineReducers } from '../commons/kits/third-party/redux/redux';
import app from './app';
import common from './common';

export default combineReducers({
    app,
    common
});
