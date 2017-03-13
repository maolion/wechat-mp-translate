import { mixin, connect, page } from '../../commons/kits/index';
import { Event } from '../../commons/kits/index';
import StatusTip from '../../commons/widgets/status-tips/status-tips';

import actions from '../../actions/actions';

import TabBar from './components/tabbar/tabbar';
import HomePage from './components/home/home';
import StarredsPage from './components/starreds/starreds';
import LangPicker from './components/lang-picker/lang-picker';

//获取应用实例
const app = getApp();
const PLAIN_OBJECT = {};

@page
@connect(
    state => {  // map state to props
        return {
            app: state.app,
            langs: state.common.langs,
            langMapping: (state.common.langs||PLAIN_OBJECT).map,
            translationMapping: state.translate.map,
            historyUids: state.translate.historyUids,
            starredUids: state.translate.starredUids
        }
    }
)
@mixin(HomePage, StarredsPage, StatusTip, TabBar, LangPicker)
class Frame extends Event {
    constructor() {
        super();

        this.data = {
            initedPageMapping: {}
        }
    }

    onLoad(query) {
        this.data.query = query || {};
    }

    onReady() {
        actions.common.getLangs();
        this.switchSubPageTo(this.data.query.subpage || 'home');
    }

    switchSubPageTo(page) {
        if (this.data.subpage === page) {
            return
        }

        let initedPageMapping = this.data.initedPageMapping || {};
        initedPageMapping[page] = true;

        this.setData({
            subpage: page,
            initedPageMapping
        });

        this.emit("subPageChange", {
            target: page
        });

        this.emit(page + "PageActived");
    }

    toggleTranslationStarred(uid) {
        let starred = !(this.data.translationMapping[uid] || PLAIN_OBJECT).starred;

        actions.translate.toggleStarred(uid, starred)
            .catch(reason => {
                wx.showModal({
                    title: "提示",
                    content: "操作失败!",
                    showCancel: false
                });
                throw reason;
            });
    }

    showTranslationDetail(translation) {

    }
}
