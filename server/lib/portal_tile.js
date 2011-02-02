var Defs    = require("defs"),
    Tile    = require("tile"),
    _       = require("underscore");

var PortalTile = module.exports = function(options) {
    Tile.apply(this, arguments);
    
    this._destZone      = options.zone   || 0;
    this._destCoords    = options.dropAt;
};

_.extend(PortalTile.prototype, Tile.prototype, {
    canMoveInto: function(actor) {
        return true;
    },
    
    moveInto: function(actor, tileIndex, tileData, world) {
        world.teleport(actor, this._destZone, this._destCoords);
    }
});
