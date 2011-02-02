var events  = require("events"),
    _       = require("underscore");

var Actor = module.exports = function() {
    events.EventEmitter.call(this);
};

_.extend(Actor.prototype, events.EventEmitter.prototype, {
    getStartingHitpoints: function() {
        return 100;
    },
    
    getZoneId: function() {
        return this._zoneId;
    },
    
    getTileIndex: function() {
        return this._tileIndex;
    },
    
    setZoneId: function(zoneId) {
        this._zoneId = zoneId;
        
        this.emit("changeZone", zoneId);
        this.emit("change");
    },
    
    setTileIndex: function(tileIndex) {
        this._tileIndex = tileIndex;
        
        this.emit("changeTileIndex", tileIndex);
        this.emit("change");
    },
    
    getHitpoints: function() {
        return this._label;
    },
    
    takeDamage: function(amount) {
        this._hitpoints = Math.max(0, this._hitpoints - amount);
        
        this.emit("tookDamage", amount, this._hitpoints);
        this.emit("changeHitpoints", this._hitpoints);
        this.emit("change");        
    },
    
    getLabel: function() {
        return this._label;
    },
    
    setLabel: function(label) {
        this._label = label;
        
        this.emit("changeLabel", label);
        this.emit("change");
    },
    
    die: function() {
        this.emit("died");
    },
    
    spawn: function() {
        this._hitpoints = this.getStartingHitpoints();
        this.emit("spawned");
    },
    
    land: function() {
        this.emit("landed");
    },
    
    leave: function() {
        this.emit("left");
    },
    
    moveFailed: function() {
        this.emit("moveFailed");
    },
    
    getRenderAttributes: function() {
        return {
            zoneId:     this.getZoneId(),
            tileIndex:  this.getTileIndex(),
            hitpoints:  this.getHitpoints(),
            label:      this.getLabel()
        };
    }
});
