export default class Event {
    constructor() {
        this._events = {};
    }

    on(type, handler) {
        if (!this._events[type]) {
            this._events[type] = [];
        }

        this._events[type].push(handler);
    }

    un(type, handler) {
        if (!this._events[type]) {
            this._events[type] = [];
        }

        if (!handler) {
            this._events[type] = [];
        } else {
            let handlers = this._events[type].slice();
            let n = 0;

            for (let i = 0, l = handlers.length; i < l; i++) {
                if (handlers[i] !== handler) {
                    handlers[n++] = handlers[i];
                }
            }

            handlers.length = n;
            this._events[type] = handlers;
        }
    }

    once(type, handler) {
        let self = this;

        this.on(type, wrapper);
        return wrapper;

        function wrapper() {
            handler.apply(this, arguments);
            self.un(type, wrapper);
        }
    }

    emit(type, event, thisObj) {
        let handlers = this._events[type];
        if (!handlers || !handlers.length) {
            return;
        }
        handlers = handlers.slice();

        for (let i = 0, l = handlers.length; i < l; i++) {
            let handler = handlers[i];
            handler.call(thisObj, event);
        }
    }
}
