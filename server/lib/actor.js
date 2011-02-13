var events          = require("events"),
    _               = require("underscore"),
    Defs            = require("defs"),
    SpellCaster     = require('spell_caster'),
    SpellTarget     = require('spell_target');

var Actor = module.exports = function(attributes) {
    events.EventEmitter.call(this);
    SpellCaster.call(this);
    SpellTarget.call(this);

    this._gameAttributes    = {};
    this._role              = Defs.ROLE_SEEKER;
    this._actorId           = Actor.actorIdCounter++;
    this._zoneId            = attributes["zoneIdx"];
    this._tileIndex         = attributes["tileIdx"];
    this._invulnTs          = 0;    
};

Actor.actorIdCounter = 0;

_.extend(Actor.prototype, events.EventEmitter.prototype, SpellCaster.prototype, SpellTarget.prototype,  {
    setGoalCounter: function(goalCounter) {
        var newGoalCounter = Math.max(0, Math.min(goalCounter, Defs.MAX_GOAL_COUNTER));
        
        if (newGoalCounter != this._goalCounter) {
            this._goalCounter = newGoalCounter;
            this.emit("changeGoalCounter", newGoalCounter);
        }
    },
    
    getGoalCounter: function() {
        return this._goalCounter;
    },
    
    getLastGoalTime: function() {
        return this._lastGoalTime;
    },
    
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
    
    takeDamage: function(amount, source) {
        this._hitpoints = Math.max(0, this._hitpoints - amount);
        
        this.emit("tookDamage", amount, this._hitpoints);
        this.emit("changeHitpoints", this._hitpoints);
        this.emit("change");        
    },

    takeSpellDamage: function(spellName, amount, caster, deathMsg) {                         
        this._hitpoints = Math.max(0, this._hitpoints - amount);

        if (this._hitpoints <= 0) {

            if (deathMsg.caster) {
                caster.emit("spellMessage", deathMsg.caster.message, deathMsg.caster.flash, Defs.CHAT_CRITICAL);
            }
            if (deathMsg.target) {
                this.emit("spellMessage", deathMsg.target.message, deathMsg.target.flash, Defs.CHAT_CRITICAL);
            }

            this.emit('deathBySpell', spellName, caster);            
        }
        
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
    
    // called each time the actor dies
    die: function() {             
        this.emit("died");
    },
    
    // called each time the actor spawns in the world (after death or connection)
    spawn: function() {
        this._hitpoints     = this.getStartingHitpoints();
        this._goalCounter   = Defs.MAX_GOAL_COUNTER;
        this._lastGoalTime  = 0;
        
        this.emit("spawned");
    },
    
    // called each time the actor appears in a zone
    land: function() {
        this.setInvulnerabilityTimestamp((new Date()).getTime() + Defs.PORTAL_INVULN_DELAY);
        this.emit("landed");
    },
    
    // called each time the actor disappears from the zone
    leave: function() {
        this.emit("left");
    },
    
    // called each time the actor tries and fails to move into a tile
    moveFailed: function() {
        this.emit("moveFailed");
    },
    
    setInvulnerabilityTimestamp: function(ts) {
        this._invulnTs = ts;
    },

    isInvulnerable: function() {
        var currentTime = (new Date()).getTime();

        return (currentTime <= this._invulnTs);
    },
    
    touchGoalTime: function() {
        this._lastGoalTime = (new Date()).getTime();
    },
    
    setGoalInventory: function(item) {
        this._goalInventory = item;
        this.emit("changeGoalInventory", item);
        
        this.touchGoalTime();
    },
    
    getGoalInventory: function() {
        return this._goalInventory;
    },

    getRole: function() {
        return this._role;
    },
    
    setRole: function(role) {
        if (this._role != role) {
            this._role = role;
            this.emit("changeRole", role);
        }
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
