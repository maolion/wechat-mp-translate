import { mixin } from '../../../../commons/kits/index';

import Source from './source';
import Suggestions from './suggestions';
import Histories from './histories';
import Translation from './translation';
import Voice from './voice';

@mixin(Source, Histories, Suggestions, Translation, Voice)
export default class HomePage {
    onReady() {
        this.on('homePageActived', () => {
        });
    }

    backToHome() {
        this.setData({
            typing: false,
            translation: null,
            suggestionUids: null
        });
    }
}
