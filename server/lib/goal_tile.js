var _       = require("underscore"),
    Defs    = require("defs"),
    Tile    = require("tile");

var GoalTile = module.exports = function(options) {
    Tile.apply(this, arguments);
    
    this.goalTile = true;
}

_.extend(GoalTile.prototype, Tile.prototype, {
    moveInto: function(actor, tileIndex, tileData, layerIndex, world) {
        world.actorIntersectsGoal(actor, this, this.getZone(), tileIndex, tileData, layerIndex);
    }
});
