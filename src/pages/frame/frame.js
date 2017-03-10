import { mixin, connect, page } from '../../commons/kits/index';
import { Event } from '../../commons/kits/index';
import StatusTip from '../../commons/widgets/status-tips/status-tips';
import TabBar from './components/tabbar/tabbar';
import HomePage from './components/home/home';
import StarredsPage from './components/starreds/starreds';
import LangPicker from './components/lang-picker/lang-picker';

//获取应用实例
const app = getApp();

@page
@connect(
    state => {  // map state to props
        return {
            app: state.app,
            langs: state.common.langs,
            translationMapping: state.translate.map,
            historyUids: state.translate.historyUids
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
        console.log(this.data);
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
}
