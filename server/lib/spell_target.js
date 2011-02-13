var _           = require("underscore"),
    events      = require("events"),
    SpellAffect = require("spell_affect"),
    SpellEvents = require("spell_events");

var SpellTarget = module.exports = function() {
    events.EventEmitter.call(this);
    
    this._spellAffects = [];
    this._targetableAt = (new Date()).getDate();
};

_.extend(SpellTarget.prototype, events.EventEmitter.prototype, {
    suspendSpellTargetabilityFor: function(duration) {
        this._targetableAt = (new Date()).getDate() + duration;
    },
    
    isValidSpellTargetFor: function(caster) {
        return ((new Date()).getTime() >= this._targetableAt);
    },
    
    getSpellAffectForSpell: function(spell) {
        return _(this._spellAffects).find(function(sa) { return sa.getSpell() == spell; });
    },

    spellTargeted: function(spellAffect) {
        var spellTarget = this;
        
        this._spellAffects.push(spellAffect);
        this.emit("spellEvent", "targeted", spellAffect);

        spellAffect.on("damaged", function(amount) {
            spellTarget.takeDamage(amount);
            
            if (spellTarget.getHitpoints() <= 0) {
                spellTarget.emit("spellEvent", "died", spellAffect);
            }
        });
        
        spellAffect.on("removed", function() {
            var idx = spellTarget._spellAffects.indexOf(spellAffect);
            
            if (idx != -1) {
                spellTarget._spellAffects.splice(idx, 1);
            }            
        });
        
        this.forwardSpellEvents(spellAffect);
    },
    
    spellAffected: function(spellAffect) {
        this.emit("spellEvent", "affected", spellAffect);
    }
});
