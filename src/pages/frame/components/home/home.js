import { mixin } from '../../../../commons/kits/index';

import Source from './source';
import Suggestions from './suggestions';
import Histories from './histories';
import Translation from './translation';

@mixin(Source, Histories, Suggestions, Translation)
export default class HomePage {
   backToHome() {
        this.setData({
            typing: false,
            translation: null,
            suggestionUids: null
        });
    }
}
