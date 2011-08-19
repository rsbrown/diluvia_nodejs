var Defs    = require("defs"),
    Tile    = require("tile"),
    _       = require("underscore");

var PlayerSpawnTile = module.exports = function(options) {
    Tile.apply(this, arguments);
    this.spawnTile = true;
};

_.extend(PlayerSpawnTile.prototype, Tile.prototype, {
 
});