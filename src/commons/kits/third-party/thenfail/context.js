"use strict";
var Context = (function () {
    function Context() {
        this._disposed = false;
        this._enclosed = false;
    }
    Object.defineProperty(Context.prototype, "disposed", {
        /**
         * (get) A boolean that indicates whether this promise context is disposed.
         * See https://github.com/vilic/thenfail# for more information.
         */
        get: function () {
            return this._disposed;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Context.prototype, "enclosed", {
        /**
         * (get) A boolean that indicates whether this promise context is enclosed.
         * See https://github.com/vilic/thenfail# for more information.
         */
        get: function () {
            return this._enclosed;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Dispose this promise context.
     * See https://github.com/vilic/thenfail# for more information.
     */
    Context.prototype.dispose = function () {
        this._disposed = true;
        this.disposeSubContexts();
    };
    /**
     * Dispose all sub contexts of this promise context.
     */
    Context.prototype.disposeSubContexts = function () {
        if (this._subContexts) {
            for (var _i = 0, _a = this._subContexts; _i < _a.length; _i++) {
                var context_1 = _a[_i];
                context_1.dispose();
            }
            this._subContexts = undefined;
        }
    };
    return Context;
}());
exports.Context = Context;