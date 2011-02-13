var SpellAffect = require("spell_affect");

var Spell = module.exports = function(options) {
    this._name      = options.name;
    this._display   = options.display;

    this._duration  = options.duration;
    this._affects   = options.affects;
};

Spell.prototype = {
    cast: function(caster, target) {
        var sa = target.getSpellAffectForSpell(this);
        
        if (target.isValidSpellTargetFor(caster)) {
            if (sa) {
                if (sa.getCaster() == caster) {
                    return sa.refresh();
                }
            }
            else {
                new SpellAffect(this, caster, target);
                return true;
            }
        }

        return false;
    },
    
    getName: function() {
        return this._name;
    },
    getDisplay: function() {                     
        return this._display;                    
    },
    getDuration: function() {
        return this._duration;
    },
    getAffects: function() {
        return this._affects;
    }
};
