import { Promise } from '../../../../commons/kits/index';
import actions from '../../../../actions/actions';

export default {
    data: {
        langPickerItems: [],
        showLangPicker: false,
        langPickerAnimationData: {}
    },

    onReady() {
        this._langPickerAnimation = wx.createAnimation({
            duration: 240,
            timingFunction: "ease-in-out"
        });

        this._langPickerClosing = false;
        this._newLangValuePromise = null;
        this._langValue = null;
    },

    pickLang(ignoreLangs) {
        return Promise
            .then(() => {
                if (this.data.langs) {
                    return this.data.langs;
                } else {
                    wx.showToast({
                        title: '加载数据...',
                        icon: 'loading',
                        duration: 10000
                    });

                    return actions.common.getLangs();
                }
            })
            .handle(error => {
                wx.hideToast();
            })
            .then(langs => {
                langs = langs.texts.slice();
                let n = 0;

                for (let i = 0, l = langs.length; i < l; i++) {
                    let lang = langs[i];

                    if (ignoreLangs.indexOf(lang) === -1) {
                        langs[n++] = lang;
                    }
                }

                langs.length = n;

                this._langValue = langs[0];
                this._newLangValuePromise = new Promise();
                this._openLangPicker(langs);
                return this._newLangValuePromise;
            })
            .fail(reason => {
                wx.showModal({
                    title: "提示",
                    content: "获取数据失败!",
                    showCancel: false
                });
                throw reason;
            });

    },

    handleLangPickerOkButtonTap() {
        this._closeLangPicker();
    },

    handleLangPickerCancelButtonTap() {
        this._langValue = null;
        this._closeLangPicker();
    },

    handleLangPickerChange(e) {
        this._langValue = this.data.langPickerItems[e.detail.value[0]];
    },

    _openLangPicker(langPickerItems) {

        this._langPickerClosing = false;
        this._langPickerAnimation
            .opacity(1)
            .translateY(0)
            .step();

        this.setData({
            langPickerAnimationData: this._langPickerAnimation.export(),
            showLangPicker: true,
            langPickerItems
        });
    },

    _closeLangPicker() {
        if (this._langPickerClosing) {
            return;
        }

        this._langPickerClosing = true;

        this._langPickerAnimation
            .opacity(0)
            .translateY(200)
            .step();

        this.setData({
            langPickerAnimationData: this._langPickerAnimation.export(),
        });

        setTimeout(() => {
            this._langPickerClosing = false;
            this.setData({
                langPickerItems: [],
                showLangPicker: false
            });

            if (this._langValue !== null) {
                this._newLangValuePromise.resolve(this._langValue);
            } else {
                this._newLangValuePromise.reject();
            }
        }, 220);
    }
}
