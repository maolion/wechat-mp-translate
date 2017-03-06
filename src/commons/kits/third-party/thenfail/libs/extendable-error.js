"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var ExtendableError = (function (_super) {
    __extends(ExtendableError, _super);
    function ExtendableError(message) {
        if (message === void 0) { message = ''; }
        _super.call(this, message);
        this.message = message;
        this.name = this.constructor.name;
        this._error = new Error();
    }
    Object.defineProperty(ExtendableError.prototype, "stack", {
        get: function () {
            if (this._stack) {
                return this._stack;
            }
            var prototype = Object.getPrototypeOf(this);
            var depth = 1;
            loop: while (prototype) {
                switch (prototype) {
                    case ExtendableError.prototype:
                        break loop;
                    case Object.prototype:
                        depth = 1;
                        break loop;
                    default:
                        depth++;
                        break;
                }
                prototype = Object.getPrototypeOf(prototype);
            }
            var stackLines = this._error.stack.match(/.+/g);
            var nameLine = this.name;
            if (this.message) {
                nameLine += ": " + this.message;
            }
            stackLines.splice(0, depth + 1, nameLine);
            return this._stack = stackLines.join('\n');
        },
        enumerable: true,
        configurable: true
    });
    return ExtendableError;
}(Error));
exports.ExtendableError = ExtendableError;
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ExtendableError;