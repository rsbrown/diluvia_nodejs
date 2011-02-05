var events          = require("events"),
    _               = require("underscore"),
    Defs            = require("defs");

var Actor = module.exports = function(attributes) {
    events.EventEmitter.call(this);
    this._gameAttributes    = {};
    this._role              = Defs.ROLE_SEEKER;
    this._actorId           = Actor.actorIdCounter++;
    this._zoneId            = attributes["zoneIdx"];
    this._tileIndex         = attributes["tileIdx"];
};

Actor.actorIdCounter = 0;

_.extend(Actor.prototype, events.EventEmitter.prototype, {    
    getStartingHitpoints: function() {
        return 100;
    },
    
    getActorId: function() {
        return this._actorId;
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
        this._hitpoints     = this.getStartingHitpoints();
        this._poisonedAt    = null;
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
    
    becomesPoisoned: function() {
        if (!this._poisonedAt) {
            this._poisonedAt = (new Date()).getTime();
        }
    },
    
    getPoisonedAt: function() {
        return this._poisonedAt;
    },
    
    setGoalInventory: function(item) {
        this._goalInventory = item;
        this.emit("changeGoalInventory", item);
    },
    
    getRole: function() {
        return this._role;
    },
    
    setRole: function(role) {
        this._role = role;
        this.emit("changeRole", role);
    },
    
    getGoalInventory: function() {
        return this._goalInventory;
    },

    getRenderAttributes: function() {
        return {
            zoneId:     this.getZoneId(),
            tileIndex:  this.getTileIndex(),
            hitpoints:  this.getHitpoints(),
            label:      this.getLabel()
        };
    },
    
    getTileDataFrom: function(tiles) {
        var actorId = this.getActorId();
                
        return _(tiles).detect(function(tileData) {
            try {
                return (tileData[1].actorId == actorId);
            }
            catch (e) {
                return false;
            }
        });
    }
});
