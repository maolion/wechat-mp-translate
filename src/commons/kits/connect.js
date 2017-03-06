import { connect } from './third-party/wechat-weapp-redux/wechat-weapp-redux';

export default function connectDecorator(mapStateToProps, mapDispatchToProps) {
    return function(Target) {
        return function () {
            let obj = new Target();
            let connectedObj = connect(mapStateToProps, mapDispatchToProps)({
                onLoad: obj.onLoad,
                onUnload: obj.onUnload
            });

            return Object.assign(obj, connectedObj);
        }
    }
}
