var _           = require("underscore"),
    events      = require("events"),
    SpellEffect = require("spell_effect"),
    SpellEvents = require("spell_events");

var SpellTarget = module.exports = function() {
    events.EventEmitter.call(this);
    
    this._spellEffects = [];
    this._targetableAt = (new Date()).getDate();
};

_.extend(SpellTarget.prototype, events.EventEmitter.prototype, {
    suspendSpellTargetabilityFor: function(duration) {
        this._targetableAt = (new Date()).getDate() + duration;
    },
    
    isValidSpellTargetFor: function(caster) {
        return ((new Date()).getTime() >= this._targetableAt);
    },
    
    getSpellEffectForSpell: function(spell) {
        return _(this._spellEffects).find(function(sa) { return sa.getSpell() == spell; });
    },

    spellTargeted: function(spellEffect) {
        var spellTarget = this;
        
        this._spellEffects.push(spellEffect);
        this.emit("spellEvent", "targeted", spellEffect);

        spellEffect.on("damaged", function(amount) {
            spellTarget.takeDamage(amount);
            
            if (spellTarget.getHitpoints() <= 0) {
                spellTarget.emit("spellEvent", "died", spellEffect);
            }
        });
                
        spellEffect.on("removed", function() {
            var idx = spellTarget._spellEffects.indexOf(spellEffect);
            
            if (idx != -1) {
                spellTarget._spellEffects.splice(idx, 1);
            }            
        });
        
        this.forwardSpellEvents(spellEffect);
    },
    
    spellEffected: function(spellEffect) {
        this.emit("spellEvent", "affected", spellEffect);
    }
});
