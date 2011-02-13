var _       = require("underscore"),
    util    = require("util");

// Fence simply calls a callback after every function passed to "tap" has
// finished executing. It assumes each function passed to tap will only
// be called once. While calling the tapped function multiple times will
// not cause harm, it may cause the "fence" callback to be executed
// multiple times and/or other erratic behavior.
var Fence = module.exports = function(callback) {
    this._callback  = callback;
    this._taps      = [];
}

Fence.prototype = {
    // wraps a function with the fence functionality
    tap: function(f) {
        var fence   = this,
            idx     = this._taps.length;
        
        this._taps[idx] = false;
        
        return function() {
            f.apply(this, arguments);
            fence._taps[idx] = true;
            fence._checkTaps();
        }
    },
    
    // declares the callback that should be called by the fence once all of the
    // tapped callbacks have been completed.
    callback: function(f) {
        this._callback = f;
    },
    
    _checkTaps: function() {
        if (_(this._taps).all(function(i) { return i == true; }) && this._callback) {
            this._callback.call();
        }
    }
};
