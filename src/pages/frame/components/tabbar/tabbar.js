export default {
    switchToIndex() {
        this.switchSubPageTo('home');
        this.setData({
            typing: false,
            translation: null
        })
    },

    switchToContacts() {
        this.switchSubPageTo('starreds');
    }
}
