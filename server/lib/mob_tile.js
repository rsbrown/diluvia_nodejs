var Defs    = require("defs"),
    Tile    = require("tile"),
    _       = require("underscore");

var MobTile = module.exports = function(options) {
    Tile.apply(this, arguments);
    this._damage = options.damage || Defs.PAIN_TILE_DAMAGE;
};

_.extend(MobTile.prototype, Tile.prototype, {
    canMoveInto: function(actor) {
        return true;
    },
    
    moveInto: function(actor) {
        actor.takeDamage(this._damage);
    }
});
