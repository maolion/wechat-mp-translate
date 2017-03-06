import { page } from '../../commons/kits/index';
import actions from '../../actions/actions';

@page
class Lanuch {
    constructor() {
        this.data = {};
    }

    onReady() {
        this.login();
    }

    login() {
        console.log('login...')
        this.setData({
            logging: true,
            failed: false
        });

        wx.showToast({
            title: '正在登录...',
            icon: 'loading',
            duration: 10000
        });

        actions.app.login()
            .then(actions.app.getUserInfo)
            .then(() => {
                console.log("login success!");
                wx.redirectTo({
                    url: '/pages/frame/frame'
                });
            })
            .handle(reason => {
                if (reason) {
                    console.error('login failed!', reason);
                }

                this.setData({
                    logging: false,
                    failed: !!reason
                });

                wx.hideToast();
            });
    }
}
