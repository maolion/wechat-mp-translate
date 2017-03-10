import actions from '../../../../actions/actions';

export default {
    onReady() {
        this.once('homePageActived', this._loadHistories);
    },

    _loadHistories() {
        this.setData({
            loadHistoriesFailed: false,
            loadingHistories: true
        });

        actions.translate.getHistories()
            .then(histories => {

            })
            .handle(hasError => {
                this.setData({
                    loadingHistories: false,
                    loadHistoriesFailed: !!hasError
                });
            });

    }
}
