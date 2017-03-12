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
            typing: false,
            translation
        });
    }
}
