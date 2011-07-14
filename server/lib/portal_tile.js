var Defs    = require("defs"),
    Tile    = require("tile"),
    _       = require("underscore");

var PortalTile = module.exports = function(options) {
    Tile.apply(this, arguments);
    
    this._destZone      = options.zone   || 0;
    this._destCoords    = options.dropAt;
    this.portalTile     = true;
};

_.extend(PortalTile.prototype, Tile.prototype, {
    canMoveInto: function(actor) {
        return true;
    },
    
    moveInto: function(actor, tileIndex, tileData, layerIndex, world) {
        world.teleport(actor, this._destZone, this._destCoords);
    },
    
    getDestinationZone:   function() { return this._destZone },
    getDestinationCoords: function() { return this._destCoords },
    setDestinationZone:   function(z) { this._destZone  = z },
    setDestinationCoords: function(c) { this._destCoords = c }
});
