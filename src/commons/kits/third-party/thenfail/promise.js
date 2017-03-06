/**
 * ThenFail v0.4
 * Just another Promises/A+ Library
 *
 * https://github.com/vilic/thenfail
 *
 * MIT License
 */
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var asap = require('../asap/asap.js');
var deprecated_decorator_1 = require('./libs/deprecated-decorator.js');
var signals_1 = require('./signals');
var context_1 = require('./context');
var errors_1 = require('./errors');
var EventEmitterConstructor;
var ChildProcessConstructor;
try {
    EventEmitterConstructor = require('events').EventEmitter;
}
catch (error) { }
try {
    ChildProcessConstructor = require('child_process').ChildProcess;
}
catch (error) { }
/**
 * Possible states of a promise.
 */
var State;
(function (State) {
    State[State["pending"] = 0] = "pending";
    State[State["fulfilled"] = 1] = "fulfilled";
    State[State["rejected"] = 2] = "rejected";
    State[State["skipped"] = 3] = "skipped";
})(State || (State = {}));
/**
 * ThenFail promise options.
 */
exports.options = {
    disableUnrelayedRejectionWarning: false,
    logger: {
        log: console.log,
        warn: console.warn,
        error: console.error
    }
};
// The core abstraction of this implementation is to imagine the behavior of promises
// as relay runners.
//  1. Grab the baton state (and value/reason).
//  2. Run and get its own state.
//  3. Relay the new state to next runners.
var Promise = (function () {
    function Promise(resolverOrContext) {
        var _this = this;
        /** Current state of this promise. */
        this._state = 0 /* pending */;
        /**
         * Indicates whether `onfulfilled` or `onrejected` handler has been called
         * but the resolved value has not become fulfilled yet.
         */
        this._running = false;
        /** Indicates whether this promise has been relayed or notified as unrelayed. */
        this._handled = false;
        if (resolverOrContext instanceof context_1.Context && !resolverOrContext._enclosed) {
            this._context = resolverOrContext;
        }
        else {
            this._context = new context_1.Context();
        }
        if (typeof resolverOrContext === 'function') {
            try {
                resolverOrContext(function (value) { return _this.resolve(value); }, function (reason) { return _this.reject(reason); });
            }
            catch (error) {
                this.reject(error);
            }
        }
    }
    /**
     * Get the state from previous promise in chain.
     */
    Promise.prototype._grab = function (previousState, previousValueOrReason) {
        if (this._state !== 0 /* pending */) {
            return;
        }
        var handler;
        if (previousState === 1 /* fulfilled */) {
            handler = this._onPreviousFulfilled;
        }
        else if (previousState === 2 /* rejected */) {
            handler = this._onPreviousRejected;
        }
        if (handler) {
            this._run(handler, previousValueOrReason);
        }
        else {
            this._relay(previousState, previousValueOrReason);
        }
    };
    /**
     * Invoke `onfulfilled` or `onrejected` handlers.
     */
    Promise.prototype._run = function (handler, previousValueOrReason) {
        var _this = this;
        this._running = true;
        asap(function () {
            var resolvable;
            try {
                resolvable = handler(previousValueOrReason);
            }
            catch (error) {
                _this._decide(2 /* rejected */, error);
                _this._running = false;
                return;
            }
            _this._unpack(resolvable, function (state, valueOrReason) {
                _this._decide(state, valueOrReason);
                _this._running = false;
            });
        });
    };
    /**
     * The resolve process defined in Promises/A+ specifications.
     */
    Promise.prototype._unpack = function (value, callback) {
        var _this = this;
        if (this === value) {
            callback(2 /* rejected */, new TypeError('The promise should not return itself'));
            return;
        }
        if (value instanceof Promise) {
            if (value._state === 0 /* pending */) {
                if (value._handledPromise) {
                    value._handledPromises = [value._handledPromise, this];
                    value._handledPromise = undefined;
                }
                else if (value._handledPromises) {
                    value._handledPromises.push(this);
                }
                else {
                    value._handledPromise = this;
                }
                var context_2 = this._context;
                if (context_2._subContexts) {
                    context_2._subContexts.push(value._context);
                }
                else {
                    context_2._subContexts = [value._context];
                }
            }
            else {
                callback(value._state, value._valueOrReason);
                value._handled = true;
            }
            return;
        }
        if (value && (typeof value === 'object' || typeof value === 'function')) {
            try {
                var then = value.then;
                if (typeof then === 'function') {
                    then.call(value, function (value) {
                        if (callback) {
                            _this._unpack(value, callback);
                            callback = undefined;
                        }
                    }, function (reason) {
                        if (callback) {
                            callback(2 /* rejected */, reason);
                            callback = undefined;
                        }
                    });
                    return;
                }
            }
            catch (error) {
                if (callback) {
                    callback(2 /* rejected */, error);
                    callback = undefined;
                }
                return;
            }
        }
        callback(1 /* fulfilled */, value);
    };
    /**
     * Decide whether to call `_relay`, `_skip` or `_goto`.
     */
    Promise.prototype._decide = function (state, valueOrReason) {
        if (valueOrReason instanceof signals_1.BreakSignal) {
            this._skip(valueOrReason);
        }
        else if (valueOrReason instanceof signals_1.GoToSignal) {
            this._goto(valueOrReason);
        }
        else {
            this._relay(state, valueOrReason);
        }
    };
    /**
     * Set the state of current promise and relay it to next promises.
     */
    Promise.prototype._relay = function (state, valueOrReason) {
        var _this = this;
        if (this._state !== 0 /* pending */) {
            return;
        }
        if (this._context._disposed) {
            this._skip();
            return;
        }
        this._state = state;
        this._valueOrReason = valueOrReason;
        if (this._chainedPromise) {
            this._chainedPromise._grab(state, valueOrReason);
        }
        else if (this._chainedPromises) {
            for (var _i = 0, _a = this._chainedPromises; _i < _a.length; _i++) {
                var promise = _a[_i];
                promise._grab(state, valueOrReason);
            }
        }
        if (this._handledPromise) {
            this._handledPromise._relay(state, valueOrReason);
        }
        else if (this._handledPromises) {
            for (var _b = 0, _c = this._handledPromises; _b < _c.length; _b++) {
                var promise = _c[_b];
                promise._relay(state, valueOrReason);
            }
        }
        asap(function () {
            if (state === 2 /* rejected */ && !_this._handled) {
                _this._handled = true;
                var relayed = !!(_this._chainedPromise || _this._chainedPromises || _this._handledPromise || _this._handledPromises);
                if (!relayed && !exports.options.disableUnrelayedRejectionWarning) {
                    var error = valueOrReason && (valueOrReason.stack || valueOrReason.message) || valueOrReason;
                    exports.options.logger.warn("An unrelayed rejection happens:\n" + error);
                }
            }
            _this._relax();
        });
    };
    /**
     * Skip some promises.
     */
    Promise.prototype._skip = function (signal) {
        if (this._state !== 0 /* pending */) {
            return;
        }
        if (this._running) {
            // if it's disposed.
            if (!signal) {
                if (this._onContextDisposed) {
                    try {
                        this._onContextDisposed.call(undefined);
                    }
                    catch (error) {
                        asap(function () {
                            throw error;
                        });
                    }
                }
            }
            this._state = 1 /* fulfilled */;
        }
        else {
            this._state = 3 /* skipped */;
        }
        if (this._chainedPromise) {
            var promise = this._chainedPromise;
            if (promise._context === this._context) {
                promise._skip(signal);
            }
            else {
                promise._grab(1 /* fulfilled */);
            }
        }
        else if (this._chainedPromises) {
            for (var _i = 0, _a = this._chainedPromises; _i < _a.length; _i++) {
                var promise = _a[_i];
                if (promise._context === this._context) {
                    promise._skip(signal);
                }
                else {
                    promise._grab(1 /* fulfilled */);
                }
            }
        }
        if (signal && signal.preliminary) {
            signal.preliminary = false;
            if (this._handledPromise) {
                this._handledPromise._skip(signal);
            }
            else if (this._handledPromises) {
                for (var _b = 0, _c = this._handledPromises; _b < _c.length; _b++) {
                    var promise = _c[_b];
                    promise._skip(signal);
                }
            }
        }
        else {
            if (this._handledPromise) {
                this._handledPromise._relay(1 /* fulfilled */);
            }
            else if (this._handledPromises) {
                for (var _d = 0, _e = this._handledPromises; _d < _e.length; _d++) {
                    var promise = _e[_d];
                    promise._relay(1 /* fulfilled */);
                }
            }
        }
        this._relax();
    };
    /**
     * Go to a specific promise that matches given label.
     */
    Promise.prototype._goto = function (signal) {
        if (this._state !== 0 /* pending */) {
            return;
        }
        this._state = this._running ? 1 /* fulfilled */ : 3 /* skipped */;
        if (this._chainedPromise) {
            var promise = this._chainedPromise;
            if (promise._label === signal.label) {
                promise._grab(1 /* fulfilled */, signal.value);
            }
            else {
                promise._goto(signal);
            }
        }
        else if (this._chainedPromises) {
            for (var _i = 0, _a = this._chainedPromises; _i < _a.length; _i++) {
                var promise = _a[_i];
                if (promise._label === signal.label) {
                    promise._grab(1 /* fulfilled */, signal.value);
                }
                else {
                    promise._goto(signal);
                }
            }
        }
        if (signal && signal.preliminary) {
            signal.preliminary = false;
            if (this._handledPromise) {
                this._handledPromise._goto(signal);
            }
            else if (this._handledPromises) {
                for (var _b = 0, _c = this._handledPromises; _b < _c.length; _b++) {
                    var promise = _c[_b];
                    promise._goto(signal);
                }
            }
        }
        else {
            if (this._handledPromise) {
                this._handledPromise._relay(1 /* fulfilled */);
            }
            else if (this._handledPromises) {
                for (var _d = 0, _e = this._handledPromises; _d < _e.length; _d++) {
                    var promise = _e[_d];
                    promise._relay(1 /* fulfilled */);
                }
            }
        }
        this._relax();
    };
    /**
     * Set handlers to undefined.
     */
    Promise.prototype._relax = function () {
        if (this._onPreviousFulfilled) {
            this._onPreviousFulfilled = undefined;
        }
        if (this._onPreviousRejected) {
            this._onPreviousRejected = undefined;
        }
        if (this._onContextDisposed) {
            this._onContextDisposed = undefined;
        }
        if (this._chainedPromise) {
            this._chainedPromise = undefined;
        }
        else {
            this._chainedPromises = undefined;
        }
        if (this._handledPromise) {
            this._handledPromise = undefined;
        }
        else {
            this._handledPromises = undefined;
        }
    };
    /**
     * The `then` method that follows
     * [Promises/A+ specifications](https://promisesaplus.com).
     * @param onfulfilled Fulfillment handler.
     * @param onrejected Rejection handler.
     * @return Created promise.
     */
    Promise.prototype.then = function (onfulfilled, onrejected) {
        var promise = new Promise(this._context);
        if (typeof onfulfilled === 'function') {
            promise._onPreviousFulfilled = onfulfilled;
        }
        if (typeof onrejected === 'function') {
            promise._onPreviousRejected = onrejected;
        }
        if (this._state === 0 /* pending */) {
            if (this._chainedPromise) {
                this._chainedPromises = [this._chainedPromise, promise];
                this._chainedPromise = undefined;
            }
            else if (this._chainedPromises) {
                this._chainedPromises.push(promise);
            }
            else {
                this._chainedPromise = promise;
            }
        }
        else {
            if (!this._handled) {
                this._handled = true;
            }
            promise._grab(this._state, this._valueOrReason);
        }
        return promise;
    };
    /**
     * Resolve the promise with a value or thenable.
     * @param resolvable The value to fulfill or thenable to resolve.
     */
    Promise.prototype.resolve = function (resolvable) {
        var _this = this;
        this._unpack(resolvable, function (state, valueOrReason) { return _this._grab(state, valueOrReason); });
    };
    /**
     * Reject this promise with a reason.
     * @param reason Rejection reason.
     */
    Promise.prototype.reject = function (reason) {
        this._grab(2 /* rejected */, reason);
    };
    /**
     * Like `then` but accepts the first extra parameter as the label of
     * current part.
     * @param label Part label.
     * @param onfulfilled Fulfillment handler.
     * @param onrejected Rejection handler.
     * @return Created promise.
     */
    Promise.prototype.label = function (label, onfulfilled, onrejected) {
        var promise = this.then(onfulfilled, onrejected);
        promise._label = label;
        return promise;
    };
    /**
     * Set up the interruption handler of the promise.
     * An interruption handler will be called if either the `onfulfilled`
     * or `onrejected` handler of the promise has been called but
     * interrupted due to context disposal.
     * (by break signal or the canceling of the context).
     * @param oninerrupted Interruption handler.
     * @return Current promise.
     */
    Promise.prototype.interruption = function (oncontextdisposed) {
        if (this._state === 0 /* pending */) {
            if (this._onContextDisposed) {
                throw new Error('Interruption handler has already been set');
            }
            this._onContextDisposed = oncontextdisposed;
        }
        else {
            // To unify error handling behavior, handler would not be invoked
            // if it's added after promise state being no longer pending.
            exports.options.logger.warn('Handler added after promise state no longer being pending');
        }
        return this;
    };
    /**
     * Enclose current promise context.
     * @return Current promise.
     */
    Promise.prototype.enclose = function () {
        this._context._enclosed = true;
        return this;
    };
    /**
     * Create a promise that will be fulfilled in given time after
     * its previous promise becomes fulfilled.
     * The fulfilled value will be relayed.
     * @param timeout Timeout in milliseconds.
     * @return Current promise.
     */
    Promise.prototype.delay = function (timeout) {
        return this.then(function (value) {
            return new Promise(function (resolve) {
                setTimeout(function () { return resolve(value); }, Math.floor(timeout) || 0);
            });
        });
    };
    /**
     * Reject the promise with `TimeoutError` if it's still pending after
     * timeout. The timer starts once this method is called
     * (usually before the fulfillment of previous promise).
     * @param timeout Timeout in milliseconds.
     * @return Current promise.
     */
    Promise.prototype.timeout = function (timeout, message) {
        var _this = this;
        this._context._enclosed = true;
        setTimeout(function () {
            if (_this._state === 0 /* pending */) {
                _this._relay(2 /* rejected */, new errors_1.TimeoutError(message));
                _this._context.disposeSubContexts();
            }
        }, Math.floor(timeout) || 0);
        return this;
    };
    Promise.prototype.handle = function (promiseOrCallback) {
        if (promiseOrCallback instanceof Promise) {
            if (this._state === 0 /* pending */) {
                if (this._handledPromise) {
                    this._handledPromises = [this._handledPromise, promiseOrCallback];
                    this._handledPromise = undefined;
                }
                else if (this._handledPromises) {
                    this._handledPromises.push(promiseOrCallback);
                }
                else {
                    this._handledPromise = promiseOrCallback;
                }
            }
            else {
                if (!this._handled) {
                    this._handled = true;
                }
                promiseOrCallback._relay(this._state, this._valueOrReason);
            }
        }
        else if (typeof promiseOrCallback === 'function') {
            this.then(function (value) {
                promiseOrCallback(undefined, value);
            }, function (reason) {
                promiseOrCallback(reason, undefined);
            });
        }
        else {
            throw new TypeError('Unsupported type to handle');
        }
        return this;
    };
    /**
     * Create a disposable resource promise.
     * @param disposor A synchronous function to handle resource disposing.
     * @return Created disposable resource promise.
     */
    Promise.prototype.disposable = function (disposer) {
        return this.then(function (resource) {
            return {
                resource: resource,
                dispose: disposer
            };
        });
    };
    /**
     * Like `then` with only an `onfulfilled` handler, but will relay the
     * previous fulfilled value instead of value returned by its own
     * `onfulfilled` handler.
     * @param onfulfilled Fulfillment handler.
     * @return Created promise.
     */
    Promise.prototype.tap = function (onfulfilled) {
        var relayValue;
        return this
            .then(function (value) {
            relayValue = value;
            return onfulfilled(value);
        })
            .then(function () { return relayValue; });
    };
    /**
     * Spread a fulfilled array-like value as arguments of the given handler.
     * @param onfulfilled Handler that takes the spread arguments.
     * @return Created promise.
     */
    Promise.prototype.spread = function (onfulfilled) {
        return this.then(function (value) { return onfulfilled.apply(undefined, value); });
    };
    /**
     * A shortcut of `promise.then(undefined, onrejected)`.
     */
    Promise.prototype.fail = function (onrejected) {
        return this.then(undefined, onrejected);
    };
    Promise.prototype.catch = function (ReasonType, onrejected) {
        if (typeof onrejected === 'function') {
            return this.then(undefined, function (reason) {
                if (reason instanceof ReasonType) {
                    return onrejected(reason);
                }
                else {
                    throw reason;
                }
            });
        }
        else {
            onrejected = ReasonType;
            return this.then(undefined, onrejected);
        }
    };
    /**
     * A shortcut of `Promise.map`, assuming the fulfilled value of
     * previous promise is a array.
     * @param callback Map callback.
     * @return Created promise.
     */
    Promise.prototype.map = function (callback) {
        return this.then(function (values) { return Promise.map(values, callback); });
    };
    /**
     * A shortcut of `Promise.map`, assuming the fulfilled value of
     * previous promise is a array.
     * @param callback Map callback.
     * @return Created promise.
     */
    Promise.prototype.reduce = function (callback, initialValue) {
        return this.then(function (values) { return Promise.reduce(values, callback, initialValue); });
    };
    /**
     * A shortcut of `Promise.each`, assuming the fulfilled value of
     * previous promise is a array.
     * @param callback Each callback.
     * @return Created promise.
     */
    Promise.prototype.each = function (callback) {
        return this.then(function (values) { return Promise.each(values, callback); });
    };
    /**
     * A shortcut of `Promise.waterfall`, take the fulfilled value of
     * previous promise as initial result.
     */
    Promise.prototype.waterfall = function (values, callback) {
        return this.then(function (initialResult) { return Promise.waterfall(values, initialResult, callback); });
    };
    Promise.prototype.retry = function (options, callback) {
        return this.then(function () { return Promise.retry(options, callback); });
    };
    /**
     * Log the value specified on fulfillment, or if not, the fulfilled value or
     * rejection reason of current promise after the previous promise becomes settled.
     * @param object Specified value to log.
     * @return Created promise.
     */
    Promise.prototype.log = function (object) {
        if (object === undefined) {
            return this.then(function (value) {
                if (value !== undefined) {
                    exports.options.logger.log(value);
                }
                return value;
            }, function (reason) {
                exports.options.logger.error(reason && (reason.stack || reason.message) || reason);
                return undefined;
            });
        }
        else {
            return this.tap(function () {
                exports.options.logger.log(object);
            });
        }
    };
    /**
     * Call `this.then` with `onrejected` handler only, and throw the
     * rejection reason if any.
     */
    Promise.prototype.done = function () {
        this.then(undefined, function (reason) {
            asap(function () {
                throw reason;
            });
        });
    };
    Object.defineProperty(Promise.prototype, "break", {
        /**
         * (get) A promise that will be rejected with a pre-break signal if previous
         * promise is fulfilled with a non-`false` value.
         */
        get: function () {
            return this.then(function (value) {
                if (value !== false) {
                    throw new signals_1.BreakSignal(true);
                }
            });
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Create a promise that will be rejected with a goto signal if previous
     * promise is fulfilled with a non-`false` value.
     */
    Promise.prototype.goto = function (label, value) {
        return this.then(function (value) {
            if (value !== false) {
                throw new signals_1.GoToSignal(label, value, true);
            }
        });
    };
    Object.defineProperty(Promise.prototype, "void", {
        /**
         * (get) A promise that will eventually be fulfilled with `undefined`.
         */
        get: function () {
            return this.then(function () { return undefined; });
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Promise.prototype, "true", {
        /**
         * (get) A promise that will eventually been fulfilled with `true`.
         */
        get: function () {
            return this.then(function () { return true; });
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Promise.prototype, "false", {
        /**
         * (get) A promise that will eventually been fulfilled with `false`.
         */
        get: function () {
            return this.then(function () { return false; });
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Promise.prototype, "context", {
        /**
         * (get) Get the context of current promise.
         */
        get: function () {
            return this._context;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Promise.prototype, "pending", {
        /**
         * (get) A boolean that indicates whether the promise is pending.
         */
        get: function () {
            return this._state === 0 /* pending */;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Promise.prototype, "fulfilled", {
        /**
         * (get) A boolean that indicates whether the promise is fulfilled.
         */
        get: function () {
            return this._state === 1 /* fulfilled */;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Promise.prototype, "rejected", {
        /**
         * (get) A boolean that indicates whether the promise is rejected.
         */
        get: function () {
            return this._state === 2 /* rejected */;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Promise.prototype, "skipped", {
        /**
         * (get) A boolean that indicates whether the promise is interrupted.
         */
        get: function () {
            return this._state === 3 /* skipped */;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Promise.prototype, "interrupted", {
        /**
         * @deperacated
         * (get) A boolean that indicates whether the promise is interrupted.
         */
        get: function () {
            return this._state === 3 /* skipped */;
        },
        enumerable: true,
        configurable: true
    });
    // Static helpers
    /**
     * A shortcut of `Promise.void.then(onfulfilled)`.
     * @param onfulfilled Fulfillment handler.
     * @return Created promise.
     */
    Promise.then = function (onfulfilled) {
        return Promise.void.then(onfulfilled);
    };
    Promise.resolve = function (resolvable) {
        if (resolvable instanceof Promise) {
            return resolvable;
        }
        else {
            var promise = new Promise();
            promise.resolve(resolvable);
            return promise;
        }
    };
    Promise.reject = function (reason) {
        var promise = new Promise();
        promise.reject(reason);
        return promise;
    };
    /**
     * Alias of `Promise.resolve`.
     */
    Promise.when = function (value) {
        return Promise.resolve(value);
    };
    /**
     * Create a promise with given context.
     * @param context Promise context.
     * @return Created promise.
     */
    Promise.context = function (context) {
        var promise = new Promise(context);
        promise.resolve();
        return promise;
    };
    /**
     * Create a promise that will be fulfilled with `undefined` in given
     * time.
     * @param timeout Timeout in milliseconds.
     * @return Created promise.
     */
    Promise.delay = function (timeout) {
        return new Promise(function (resolve) {
            setTimeout(function () { return resolve(); }, Math.floor(timeout) || 0);
        });
    };
    // TODO: change return type to Promise<T[]> after TypeDoc upgrades.
    Promise.all = function (resolvables) {
        if (!resolvables.length) {
            return Promise.resolve([]);
        }
        var resultsPromise = new Promise();
        var results = [];
        var remaining = resolvables.length;
        var rejected = false;
        resolvables.forEach(function (resolvable, index) {
            Promise
                .resolve(resolvable)
                .then(function (result) {
                if (rejected) {
                    return;
                }
                results[index] = result;
                if (--remaining === 0) {
                    resultsPromise.resolve(results);
                }
            }, function (reason) {
                if (rejected) {
                    return;
                }
                rejected = true;
                resultsPromise.reject(reason);
                results = undefined;
            });
        });
        return resultsPromise;
    };
    /**
     * Create a promise that is settled the same way as the first passed promise to settle.
     * It resolves or rejects, whichever happens first.
     * @param resolvables Promises or values to race.
     * @return Created promise.
     */
    Promise.race = function (resolvables) {
        var promise = new Promise();
        for (var _i = 0, resolvables_1 = resolvables; _i < resolvables_1.length; _i++) {
            var resolvable = resolvables_1[_i];
            Promise
                .resolve(resolvable)
                .handle(promise);
        }
        return promise;
    };
    /**
     * A promise version of `Array.prototype.map`.
     * @param values Values to map.
     * @param callback Map callback.
     * @return Created promise.
     */
    Promise.map = function (values, callback) {
        var results = new Array(values.length);
        return values
            .reduce(function (promise, value, index, values) {
            return promise
                .then(function () { return callback(value, index, values); })
                .then(function (result) {
                results[index] = result;
            });
        }, Promise.resolve())
            .then(function () { return results; });
    };
    /**
     * A promise version of `Array.prototype.reduce`.
     * @param values Values to reduce.
     * @param callback Reduce callback.
     * @return Created promise.
     */
    Promise.reduce = function (values, callback, initialValue) {
        return values.reduce(function (promise, value, index, values) {
            return promise.then(function (previousValue) {
                return callback(previousValue, value, index, values);
            });
        }, Promise.resolve(initialValue));
    };
    /**
     * (breakable) Iterate elements in an array one by one.
     * TResult `false` or a promise that will eventually be fulfilled with
     * `false` to interrupt iteration.
     * @param values Values to iterate.
     * @param callback Each callback.
     * @return A promise that will be fulfiled with a boolean which
     *     indicates whether the iteration completed without interruption.
     */
    Promise.each = function (values, callback) {
        return values
            .reduce(function (promise, value, index, values) {
            return promise.then(function (result) {
                if (result === false) {
                    throw new signals_1.BreakSignal();
                }
                return callback(value, index, values);
            });
        }, Promise.resolve(undefined))
            .then(function () { return true; })
            .enclose()
            .then(function (completed) { return !!completed; });
    };
    /**
     * (breakable) Pass the last result to the same callback with pre-set values.
     * @param values Pre-set values that will be passed to the callback one
     *     by one.
     * @param initialResult The initial result for the very first call.
     * @param callback Waterfall callback.
     */
    Promise.waterfall = function (values, initialResult, callback) {
        var lastResult = initialResult;
        return Promise
            .each(values, function (value, index, array) {
            var callbackPromise = Promise
                .then(function () { return callback(value, lastResult, index, array); })
                .then(function (result) { return result; });
            return callbackPromise
                .enclose()
                .then(function (result) {
                if (callbackPromise.interrupted) {
                    return false;
                }
                else {
                    lastResult = result;
                    return;
                }
            });
        })
            .then(function () { return lastResult; });
    };
    Promise.retry = function (options, callback) {
        if (options === void 0) { options = {}; }
        if (callback === undefined &&
            typeof options === 'function') {
            callback = options;
            options = {};
        }
        var _a = options.limit, limit = _a === void 0 ? 3 : _a, _b = options.interval, interval = _b === void 0 ? 0 : _b;
        var lastReason;
        var attemptIndex = 0;
        return process();
        function process() {
            return Promise
                .then(function () { return callback(lastReason, attemptIndex++); })
                .enclose()
                .fail(function (reason) {
                if (attemptIndex >= limit) {
                    throw reason;
                }
                lastReason = reason;
                if (interval) {
                    return Promise
                        .delay(interval)
                        .then(function () { return process(); });
                }
                else {
                    return process();
                }
            });
        }
    };
    /**
     * Use a disposable resource and dispose it after been used.
     * @param disposable The disposable resource or a thenable of
     *     disposable resource.
     * @param handler Using handler.
     * @return Created promise.
     */
    Promise.using = function (disposable, handler) {
        var resolvedDisposable;
        var promise = Promise
            .resolve(disposable)
            .then(function (disposable) {
            resolvedDisposable = disposable;
            return handler(disposable.resource);
        });
        var disposed = false;
        function dispose() {
            if (!disposed) {
                // Change the value of `disposed` first to avoid exception in
                // `resolvedDisposable.dispose()` causing `onrejected` handler been called
                // again.
                disposed = true;
                resolvedDisposable.dispose(resolvedDisposable.resource);
            }
        }
        promise
            .interruption(dispose)
            .then(dispose, dispose);
        return promise;
    };
    Promise.invoke = function (fn) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        return new Promise(function (resolve, reject) {
            args = args.concat(function (error, value) {
                if (error) {
                    reject(error);
                }
                else {
                    resolve(value);
                }
            });
            fn.apply(undefined, args);
        });
    };
    Promise._forChildProcess = function (process) {
        return new Promise(function (resolve, reject) {
            process.on('exit', onexit);
            process.on('error', onerror);
            function removeListeners() {
                process.removeListener('exit', onexit);
                process.removeListener('error', onerror);
            }
            function onexit(code) {
                removeListeners();
                if (code === 0) {
                    resolve();
                }
                else {
                    reject(new Error('Invalid exit code'));
                }
            }
            function onerror(error) {
                asap(removeListeners);
                reject(error);
            }
        });
    };
    Promise._forEventEmitter = function (emitter, types, errorEmitters) {
        if (errorEmitters === void 0) { errorEmitters = []; }
        errorEmitters.unshift(emitter);
        if (typeof types === 'string') {
            types = [types];
        }
        return new Promise(function (resolve, reject) {
            for (var _i = 0, types_1 = types; _i < types_1.length; _i++) {
                var type = types_1[_i];
                emitter.on(type, onsuccess);
            }
            for (var _a = 0, errorEmitters_1 = errorEmitters; _a < errorEmitters_1.length; _a++) {
                var emitter_1 = errorEmitters_1[_a];
                emitter_1.on('error', onerror);
            }
            function removeListeners() {
                for (var _i = 0, types_2 = types; _i < types_2.length; _i++) {
                    var type = types_2[_i];
                    emitter.removeListener(type, onsuccess);
                }
                for (var _a = 0, errorEmitters_2 = errorEmitters; _a < errorEmitters_2.length; _a++) {
                    var emitter_2 = errorEmitters_2[_a];
                    emitter_2.removeListener('error', onerror);
                }
            }
            function onsuccess(value) {
                removeListeners();
                resolve(value);
            }
            function onerror(error) {
                asap(removeListeners);
                reject(error);
            }
        });
    };
    Promise.for = function (emitter, types, errorEmitters) {
        if (ChildProcessConstructor && emitter instanceof ChildProcessConstructor && types === undefined) {
            return this._forChildProcess(emitter);
        }
        if (EventEmitterConstructor && emitter instanceof EventEmitterConstructor) {
            return this._forEventEmitter(emitter, types, errorEmitters);
        }
        throw new TypeError('Unsupported object');
    };
    Object.defineProperty(Promise, "break", {
        /**
         * (fake statement) This getter will always throw a break signal that interrupts the promises chain.
         *
         * Example:
         *
         * ```ts
         * promise
         *     .then(() => {
         *         if (toBreak) {
         *             Promise.break;
         *         }
         *
         *         // Or not to break.
         *     })
         *     .then(() => {
         *         // If `toBreak` is true, it will never enter this handler.
         *     }, () => {
         *         // Nor this handler.
         *     });
         * ```
         */
        get: function () {
            throw new signals_1.BreakSignal();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Promise, "breakSignal", {
        /** (get) The break signal. */
        get: function () {
            return new signals_1.BreakSignal();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Promise, "preBreakSignal", {
        /** (get) The pre-break signal. */
        get: function () {
            return new signals_1.BreakSignal(true);
        },
        enumerable: true,
        configurable: true
    });
    /** (fake statement) This method will throw an `GoToSignal` with specified `label`. */
    Promise.goto = function (label, value) {
        throw new signals_1.GoToSignal(label, value);
    };
    Object.defineProperty(Promise, "void", {
        /**
         * (get) A promise that has already been fulfilled with `undefined`.
         */
        get: function () {
            var promise = new Promise();
            promise.resolve(undefined);
            return promise;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Promise, "true", {
        /**
         * (get) A promise that has already been fulfilled with `true`.
         */
        get: function () {
            var promise = new Promise();
            promise.resolve(true);
            return promise;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Promise, "false", {
        /**
         * (get) A promise that has already been fulfilled with `false`.
         */
        get: function () {
            var promise = new Promise();
            promise.resolve(false);
            return promise;
        },
        enumerable: true,
        configurable: true
    });
    __decorate([
        deprecated_decorator_1.default('skipped', '0.4')
    ], Promise.prototype, "interrupted", null);
    return Promise;
}());
exports.Promise = Promise;
exports.using = Promise.using;
exports.invoke = Promise.invoke;