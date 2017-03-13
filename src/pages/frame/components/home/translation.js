import { Promise } from '../../../../commons/kits/index';
import actions from '../../../../actions/actions';

export default {
    showTranslation(uid) {
        let translationMapping = this.data.translationMapping || {};

        if (!translationMapping[uid]) {
            return;
        }

        let currentTranslation = this.data.translation;

        if (currentTranslation && currentTranslation.uid === uid &&
            !this.data.typing) {
            return;
        }

        let translation = translationMapping[uid];

        actions.translate.pushHistory(translation);

        this.setData({
            playingSourceVoice: false,
            playingDestVoice: false,
            typing: false,
            translation
        });
    },

    handleSourcePhoneticButtonTap() {
        this.setData({
            playingSourceVoice: true
        });

        this.playVoice(this.data.translation.source.content)
            .handle(() => {
                this.setData({
                    playingSourceVoice: false
                });
            });
    },

    handleDestPhoneticButtonTap() {
        this.setData({
            playingDestVoice: true
        });

        this.playVoice(this.data.translation.dest.content)
            .handle(() => {
                this.setData({
                    playingDestVoice: false
                });
            });
    },

    translate(content, sourceLang, destLang) {
        return this._translateFromCache(content, sourceLang, destLang)
            .then(translation => {
                if (!translation) {
                    return actions.translate.getTranslation(content, sourceLang, destLang);
                } else {
                    return translation;
                }
            })
            .then(translation => {
                this.showTranslation(translation.uid);
            });
    },

    _translateFromCache(word, sourceLang, destLang) {
        let translationMapping = this.data.translationMapping || {};
        let lowerCaseWord = word.toLowerCase();

        return Promise
            .then(() => {
                let translation = null;

                for (let key of Object.keys(translationMapping)) {
                    translation = translationMapping[key];

                    if (translation.source.lang == sourceLang &&
                        translation.dest.lang == destLang &&
                        translation.source.content.toLowerCase() === lowerCaseWord
                    ) {
                        break;
                    }

                    translation = null;
                }

                return translation;
            });
    }
}
