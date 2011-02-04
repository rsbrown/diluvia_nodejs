var _       = require("underscore"),
    Actor   = require("actor"),
    events  = require("events");

var Player = module.exports = function(attributes) {
    Actor.call(this, attributes);
    
    this._orientation = attributes["orientation"] || "n";    
    this._score       = 0;
};

_.extend(Player.prototype, Actor.prototype, events.EventEmitter.prototype, {
    setOrientation: function(orientation) {
        this._orientation = orientation;
        this.emit("changeOrientation", orientation);
    },
    
    getOrientation: function() {
        return this._orientation;
    }
});
