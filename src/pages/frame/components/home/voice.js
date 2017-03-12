import { Promise } from '../../../../commons/kits/index';
import config from '../../../../config';

export default {
    onReady() {
        console.log(".....");
        this._voiceAudioCtx = this.audioCtx = wx.createAudioContext('voice');
    },
    playVoice(content) {
        this._voiceAudioCtx.setSrc(`${config.api_host}/api/voice?text=${encodeURIComponent(content)}&lang=zh`);
        this._voiceAudioCtx.seek(0);
        this._voiceAudioCtx.play();

        if (this._playVoicePromise) {
            this._playVoicePromise.reject();
        }

        this._playVoicePromise = new Promise();
        return this._playVoicePromise;
    },
    handleVoiceError() {
        this._playVoicePromise.reject();
    },
    handleVoicePlay() {

    },
    handleVoiceEnded() {
        this._playVoicePromise.resolve();
    }
}
