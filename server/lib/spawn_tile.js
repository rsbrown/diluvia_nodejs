var Defs    = require("defs"),
    Tile    = require("tile"),
    _       = require("underscore");

var SpawnTile = module.exports = function(options) {
    Tile.apply(this, arguments);
    this.spawnTile = true;
};

_.extend(SpawnTile.prototype, Tile.prototype, {
 
});