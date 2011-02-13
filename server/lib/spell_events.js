var _ = require("underscore");

var SpellEvents = module.exports = function() {
    
};

SpellEvents.FORWARD_SPELL_EVENTS = [ "damaged", "faded", "removed", "completed" ];

SpellEvents.prototype = {
    forwardSpellEvents: function(spellAffect) {
        var self = this;
        
        _(SpellEvents.FORWARD_SPELL_EVENTS).each(function(eventName) {
            spellAffect.on(eventName, function() {
                self.emit("spellEvent", eventName, spellAffect);
            });
        });
    }
};
