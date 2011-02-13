var Defs    = require("defs"),
    Tile    = require("tile"),
    _       = require("underscore");

var PainTile = module.exports = function(options) {
    Tile.apply(this, arguments);
    
    this._damage    = options.damage    || Defs.PAIN_TILE_DAMAGE;
    this._interval  = options.interval  || Defs.PAIN_TILE_INTERVAL;
    
    this._damaging  = [];
    
    this._setupDamageInterval();
};

_.extend(PainTile.prototype, Tile.prototype, {
    moveInto: function(actor) {
        if (this._damage == -1) {
            actor.takeDamage(Defs.MAX_HITPOINTS);
        }
        else {
            var idx = this._damaging.indexOf(actor);

            if (idx == -1) {
                this._damaging.push(actor);
            }            
        }
    },
    
    moveOut: function(actor) {        
        var idx = this._damaging.indexOf(actor);
        
        if (idx != -1) {
            this._damaging.splice(actor, 1);
        }
    },
    
    _damageActor: function(actor) {
        actor.takeDamage(this._damage);
    },
    
    _onDamageInterval: function() {
        for (var i = 0, len = this._damaging.length; i < len; i++) {
            this._damageActor(this._damaging[i]);
        }
    },
    
    _setupDamageInterval: function() {
        var self = this;

        setInterval(function() {
            self._onDamageInterval();
        }, this._interval);
    }
});
