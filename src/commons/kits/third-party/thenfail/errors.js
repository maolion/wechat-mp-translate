"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var extendable_error_1 = require('./libs/extendable-error');
/**
 * TimeoutError class.
 */
var TimeoutError = (function (_super) {
    __extends(TimeoutError, _super);
    function TimeoutError() {
        _super.apply(this, arguments);
    }
    return TimeoutError;
}(extendable_error_1.default));
exports.TimeoutError = TimeoutError;