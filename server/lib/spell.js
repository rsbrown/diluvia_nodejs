var _ = require('underscore');

var Spell = module.exports = function(options) {
    this._name              = options.name;
    this._display           = options.display;

    this._duration          = options.duration;
    this._affects           = options.affects
};

Spell.prototype = {
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

