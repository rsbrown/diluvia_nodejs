var Defs    = require("defs"),
    Tile    = require("tile"),
    _       = require("underscore");

var DEFAULT_DAMAGE              = 25,
    DEFAULT_DAMAGE_INTERVAL     = 1000;

var PainTile = module.exports = function(options) {
    Tile.apply(this, arguments);
    
    this._damage    = options.damage    || DEFAULT_DAMAGE;
    this._interval  = options.interval  || DEFAULT_DAMAGE_INTERVAL;
    
    this._damaging  = [];
    
    this._setupDamageInterval();
};

_.extend(PainTile.prototype, Tile.prototype, {
    moveInto: function(actor) {
        var idx = this._damaging.indexOf(actor);

        if (idx == -1) {
            this._damaging.push(actor);
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
