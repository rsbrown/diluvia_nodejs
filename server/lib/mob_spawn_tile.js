var Defs    = require("defs"),
    Tile    = require("tile"),
    _       = require("underscore");

var MobSpawnTile = module.exports = function(options) {
    Tile.apply(this, arguments);
    this._damage = options.damage || Defs.PAIN_TILE_DAMAGE;
    this._rate   = options.rate   || 1;
    this._period = options.period || 1000;
    this._initialize();
};

_.extend(MobSpawnTile.prototype, Tile.prototype, {
    canMoveInto: function(actor) {
        return true;
    },
    
    moveInto: function(actor) {
        actor.takeDamage(this._damage);
    },
    
    _onInterval: function() {
        // console.log("spawning mob");
    },  
    
    _initialize: function() {
        this._startInterval();
    },

    _startInterval: function() {
        this._interval = setInterval(_(this._onInterval).bind(this), this._period);
    },
    
    stop: function() {
        if (this._interval) {
            clearInterval(this._interval);
        }
    }
});
