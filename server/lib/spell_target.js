var _           = require('underscore'),
    events      = require('events'),
    SpellAffect = require('spell_affect');

var SpellTarget = module.exports = function() {
    events.EventEmitter.call(this);
    this._spellEffects = {};
};

_.extend(SpellTarget.prototype, events.EventEmitter.prototype, {
    isAffectedBySpell: function(spellName) {
        return this._spellEffects[spellName];
    },

    applySpell: function(spell, caster) {
        if (!this.isInvulnerable() ) {//this works for assassin game but prob need to be more generic

            var spellName       = spell.getName(),
                spellDuration   = spell.getDuration();

            if (spellDuration && spellDuration.period > 0) {
                var spellAffect = this.isAffectedBySpell(spellName);
    
                if (!spellAffect) {
                    this._spellEffects[spellName] = new SpellAffect(spell, caster, this);                
                } else {
                    if (spellDuration.refreshable) {
                        if (spellAffect.getCaster() == caster) {
                            spellAffect.refreshDuration()
                        } else {
                            //can others refresh someone else's spell ?
                        }
                    } else {
                        //spell can't be recast on this target right now
                    }
                }
            } else {
                //instant spell
                new SpellAffect(spell, caster, this);
            }
        }
    },

    removeSpellAffect: function(spellName) {
        var sa = this._spellEffects[spellName];
        if (sa) {
            sa.stop();                      
            delete this._spellEffects[spellName];
        }
    },

    clearSpellEffects: function() {                       
        var self = this;
        _.each(this._spellEffects, function(val, key, list) {
            self.removeSpellAffect(key);            
        });                
    }
});
