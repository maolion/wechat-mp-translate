"use strict";
var BreakSignal = (function () {
    function BreakSignal(preliminary) {
        if (preliminary === void 0) { preliminary = false; }
        this.preliminary = preliminary;
    }
    return BreakSignal;
}());
exports.BreakSignal = BreakSignal;
var GoToSignal = (function () {
    function GoToSignal(label, value, preliminary) {
        if (preliminary === void 0) { preliminary = false; }
        this.label = label;
        this.value = value;
        this.preliminary = preliminary;
    }
    return GoToSignal;
}());
exports.GoToSignal = GoToSignal;