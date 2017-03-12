import actions from '../../../../actions/actions';

export default {
    showTranslation(uid) {
        let translationMapping = this.data.translationMapping|| {};

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
}
