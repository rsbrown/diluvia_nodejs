var SpellEffect = require("spell_effect");

var Spell = module.exports = function(options) {
    this._name      = options.name;
    this._display   = options.display;

    this._duration  = options.duration;
    this._effects   = options.effects;
};

Spell.prototype = {
    cast: function(caster, target) {
        var sa = target.getSpellEffectForSpell(this);
        
        if (target.isValidSpellTargetFor(caster)) {
            if (sa) {
                if (sa.getCaster() == caster) {
                    return sa.refresh();
                }
            }
            else {
                new SpellEffect(this, caster, target);
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
    getEffects: function() {
        return this._effects;
    }
};
