import { Provider } from './third-party/wechat-weapp-redux/wechat-weapp-redux';

export default function ProviderDecorator(store) {
    return function(Target) {
        return function () {
            return Object.assign(new Target(), Provider(store)(null))
        }
    }
}
