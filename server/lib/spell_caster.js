var _       = require('underscore');
    events  = require('events');

var SpellCaster = module.exports = function() {
    events.EventEmitter.call(this);
};

_.extend(SpellCaster.prototype, events.EventEmitter.prototype, {
    spellCasted: function(spellEffect) {
        var spellCaster = this;
        
        this.emit("spellEvent", "casted", spellEffect);
        this.forwardSpellEvents(spellEffect);
    }
});
