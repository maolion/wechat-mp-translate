import { Promise } from '../../../../commons/kits/index';
import actions from '../../../../actions/actions';

const CLOSED = 1;
const CLOSING = 2;
const OPENING = 4;
const OPENED = 8;

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

        this._langPickerState = CLOSED;
        this._newLangValuePromise = null;
        this._langValue = null;
        this._fxDelayTimer = null;
    },

    pickLang(ignoreLangs) {
        return Promise
            .then(() => {
                if (this.data.langs) {
                    return this.data.langs;
                } else {
                    wx.showToast({
                        mask: true,
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
            .fail(reason => {
                wx.showModal({
                    title: "提示",
                    content: "获取数据失败!",
                    showCancel: false
                });
                throw reason;
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
        if (this._langPickerState & OPENING + OPENED) {
            return;
        }

        this._langPickerState = OPENING;

        this.setData({
            langPickerItems,
            showLangPicker: true
        });

        clearTimeout(this._fxDelayTimer);

        this._fxDelayTimer = setTimeout(() => {
            this._langPickerState = OPENED;

            this._langPickerAnimation
                .opacity(1)
                .translateY(0)
                .step();

            this.setData({
                langPickerAnimationData: this._langPickerAnimation.export(),
            });
        }, 0);
    },

    _closeLangPicker() {
        if (this._langPickerState & CLOSING + CLOSED) {
            return;
        }

        this._langPickerState = CLOSING;

        this._langPickerAnimation
            .opacity(0)
            .translateY(200)
            .step();

        this.setData({
            langPickerAnimationData: this._langPickerAnimation.export(),
        });

        clearTimeout(this._fxDelayTimer);

        this._fxDelayTimer = setTimeout(() => {
            this._langPickerState = CLOSED;

            this.setData({
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
