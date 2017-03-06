"use strict";
var promise_1 = require('../promise');
/**
 * `Lock` class is a useful helper that can act as a simple task queue.
 */
var Lock = (function () {
    function Lock() {
        this._promise = promise_1.Promise.void;
    }
    /**
     * Handler will be called once the return value of previous queued handler
     * gets settled.
     * @param handler Queue handler.
     * @return Created promise, will be settled once the handler throws an
     *     error or the return value of the handler gets settled.
     */
    Lock.prototype.queue = function (handler) {
        var promise = this._promise.then(handler);
        this._promise = promise.void.fail(function (reason) { return undefined; });
        return promise;
    };
    /**
     * Handler will be called if there's no queued ones.
     * @param handler Try handler.
     * @return Created promise, will be settled once the handler throws an
     *     error or the return value of the handler gets settled.
     */
    Lock.prototype.try = function (handler) {
        if (this._promise.pending) {
            return this._promise;
        }
        else {
            return this.queue(handler);
        }
    };
    Object.defineProperty(Lock.prototype, "queuer", {
        /**
         * (get) A function that binds `queue` method with current instance.
         */
        get: function () {
            return this.queue.bind(this);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Lock.prototype, "trier", {
        /**
         * (get) A function that binds `try` method with current instance.
         */
        get: function () {
            return this.try.bind(this);
        },
        enumerable: true,
        configurable: true
    });
    return Lock;
}());
exports.Lock = Lock;