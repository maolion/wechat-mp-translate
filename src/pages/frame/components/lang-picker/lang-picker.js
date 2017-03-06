import { Promise } from '../../../../commons/kits/index';

const LANGS = ['中文 (简体)', '中文 (繁体)', '英文', '闽南话', '四川话', '东北话', '上海话', '日文', '韩文', '俄文']


export default {
    data: {
        languages: [],
        showLangPicker: false,
        langPickerAnimationData: {}
    },

    onReady() {
        this._langPickerAnimation = wx.createAnimation({
            duration: 200,
            timingFunction: "ease"
        });

        this._langPickerClosing = false;
        this._newLangValuePromise = null;
        this._langValue = null;
    },

    pickLang(ignoreLangs) {
        let langs = LANGS.slice();
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
    },

    handleLangPickerOkButtonTap() {
        this._closeLangPicker();
    },

    handleLangPickerCancelButtonTap() {
        this._langValue = null;
        this._closeLangPicker();
    },

    handleLangPickerChange(e) {
        this._langValue = this.data.langs[e.detail.value[0]];
    },

    _openLangPicker(langs) {

        this._langPickerClosing = false;
        this._langPickerAnimation
            .opacity(1)
            .translateY(0)
            .step();

        this.setData({
            langPickerAnimationData: this._langPickerAnimation.export(),
            showLangPicker: true,
            langs
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
                langs: [],
                showLangPicker: false
            });

            if (this._langValue !== null) {
                this._newLangValuePromise.resolve(this._langValue);
            } else {
                this._newLangValuePromise.reject();
            }
        }, 160);
    }
}
