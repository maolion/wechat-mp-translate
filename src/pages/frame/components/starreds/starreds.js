import actions from '../../../../actions/actions';

export default {
    onReady() {
        this.once('starredsPageActived', this._loadStarreds);
        this.on('starredsPageActived', () => {

        });
    },

    handleStarredItemBtnTap(event) {
        let uid = event.currentTarget.dataset.uid;

        if (this._starredActionSheetShowing) {
            return;
        }

        this.showTranslation(uid);
        this.switchSubPageTo('home');
    },

    handleStarredItemToggleStarredBtnTap(event) {
        let uid = event.currentTarget.dataset.uid;
        this.toggleTranslationStarred(uid);
    },

    handleStarredItemLongTap(event) {
        let uid = event.currentTarget.dataset.uid;
        this._starredActionSheetShowing = true;

        wx.showActionSheet({
            itemList: ['取消星标'],
            success: (res) => {
                if (res.tapIndex !== 0) {
                    return;
                }

                this.toggleTranslationStarred(uid);
            },
            complete: () => {
                this._starredActionSheetShowing = false;
            }
        });
    },

    _loadStarreds() {
        actions.translate.getStarreds();
    }
}
