var _           = require('underscore'),
    events      = require('events'),
    SpellAffect = require('spell_affect');

var SpellTarget = module.exports = function() {
    events.EventEmitter.call(this);
    this._spellAffects = {};
};

_.extend(SpellTarget.prototype, events.EventEmitter.prototype, {
    isAffectedBySpell: function(spellName) {
        return this._spellAffects[spellName];
    },

    applySpell: function(spell, caster) {
        if (!this.isInvulnerable() ) {//this works for assassin game but prob need to be more generic

            var spellName       = spell.getName(),
                spellDuration   = spell.getDuration();

            if (spellDuration && spellDuration.period > 0) {
                var spellAffect = this.isAffectedBySpell(spellName);
    
                if (!spellAffect) {
                    this._spellAffects[spellName] = new SpellAffect(spell, caster, this);                
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
        var sa = this._spellAffects[spellName];
        if (sa) {
            sa.stop();                      
            delete this._spellAffects[spellName];
        }
    },

    clearSpellAffects: function() {                       
        var self = this;
        _.each(this._spellAffects, function(val, key, list) {
            self.removeSpellAffect(key);            
        });                
    }
});
