var _       = require('underscore');
    events  = require('events');

var SpellCaster = module.exports = function() {
    events.EventEmitter.call(this);
};

_.extend(SpellCaster.prototype, events.EventEmitter.prototype, {
    spellCasted: function(spellAffect) {
        var spellCaster = this;
        
        this.emit("spellEvent", "casted", spellAffect);
        
        spellAffect.on("completed", function() {
            spellCaster.emit("spellEvent", "completed", spellAffect);
        });
        
        this.forwardSpellEvents(spellAffect);
    }
});
