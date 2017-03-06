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
            starred: state.starred,
            histories: state.histories
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
