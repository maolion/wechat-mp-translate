export default {
    handleStatusTipRetryBtnTap() {
        this.emit('retry');
    },

    handleStatusTipRefrshBtnTap() {
        this.emit('refresh');
    }
}