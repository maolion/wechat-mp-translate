"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var deprecated_decorator_1 = require('../libs/deprecated-decorator');
var promise_1 = require('../promise');
/** @deprecated */
var PromiseLock = (function () {
    function PromiseLock() {
        this._promise = promise_1.Promise.void;
    }
    PromiseLock.prototype.lock = function (handler) {
        var promise = this._promise.then(handler);
        this._promise = promise.void.fail(function (reason) { return undefined; });
        return promise;
    };
    Object.defineProperty(PromiseLock.prototype, "locker", {
        get: function () {
            return this.lock.bind(this);
        },
        enumerable: true,
        configurable: true
    });
    PromiseLock = __decorate([
        deprecated_decorator_1.default('Lock', '0.4')
    ], PromiseLock);
    return PromiseLock;
}());
exports.PromiseLock = PromiseLock;