import actions from '../../../../actions/actions';

export default {
    onReady() {
        this.once('homePageActived', this._loadHistories);
    },

    handleHistoryItemBtnTap(event) {
        if (this._historyActionSheetShowing) {
            return;
        }

        let uid = event.currentTarget.dataset.uid;
        this.showTranslation(uid);
    },

    handleHistoryItemToggleStarredBtnTap(event) {
        let uid = event.currentTarget.dataset.uid;
        this.toggleTranslationStarred(uid);
    },

    handleHistoryItemLongTap(event) {
        let uid = event.currentTarget.dataset.uid;

        this._historyActionSheetShowing = true;

        wx.showActionSheet({
            itemList: ['删除项目'],
            success: (res) => {
                if (res.tapIndex !== 0) {
                    return;
                }

                this._removeHistoryItem(uid);
            },
            complete: () => {
                this._historyActionSheetShowing = false;
            }
        });
    },

    _loadHistories() {
        actions.translate.getHistories();
    },

    _removeHistoryItem(uid) {
        actions.translate.deleteHistories([uid])
            .catch(reason => {
                wx.showModal({
                    title: "提示",
                    content: "操作失败!",
                    showCancel: false
                });

                throw reason;
            });
    }
}
