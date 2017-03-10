import { combineReducers } from '../commons/kits/third-party/redux/redux';
import app from './app';
import common from './common';
import translate from './translate';

export default combineReducers({
    app,
    common,
    translate
});
