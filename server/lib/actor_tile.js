var Defs    = require("defs"),
    Tile    = require("tile"),
    _       = require("underscore");

var ActorTile = module.exports = function(options) {
    Tile.apply(this, arguments);
};

_.extend(ActorTile.prototype, Tile.prototype, {
    canMoveInto: function(actor) {
        return false;
    }
});
