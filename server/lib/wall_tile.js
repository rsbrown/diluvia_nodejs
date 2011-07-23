var Defs    = require("defs"),
    Tile    = require("tile"),
    _       = require("underscore");
    
var WallTile = module.exports = function(options) {
    Tile.apply(this, arguments);
};

_.extend(WallTile.prototype, Tile.prototype, {
    canMoveInto: function(actor) {
      return false;
    },
    
    isImpassable: function() {
      return true;
    }
});
