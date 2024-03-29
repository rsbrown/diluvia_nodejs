var _           = require("underscore"),
    Actor       = require("actor"),
    events      = require("events");

var Player = module.exports = function(attributes) {
    Actor.call(this, attributes);
    
    this._orientation = attributes["orientation"] || "n";    
    this._name        = attributes['username'];
    this._score       = 0;
};

_.extend(Player.prototype, Actor.prototype, events.EventEmitter.prototype, {
    setOrientation: function(orientation) {
        this._orientation = orientation;
        this.emit("changeOrientation", orientation);
    },
    
    getOrientation: function() {
        return this._orientation;
    },
    
    getRenderTileId: function() {
      return this.getOrientationTileMap()[this.getOrientation().toUpperCase()];
    },
    
    getOrientationTileMap: function() {
      return {
        "N": 1,
        "S": 2,
        "E": 3,
        "W": 4
      };
    },

    getName: function() {
        return this._name;
    }
});
