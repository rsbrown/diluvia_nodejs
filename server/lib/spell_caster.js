var _       = require('underscore');
    events  = require('events');

var SpellCaster = module.exports = function() {
    events.EventEmitter.call(this);
};

_.extend(SpellCaster.prototype, events.EventEmitter.prototype, {
    castSpell: function(spell, target) {
        target.applySpell(spell, this);
    }
});
