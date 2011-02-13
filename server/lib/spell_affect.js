var _       = require("underscore"),
    events  = require("events");

var SpellAffect = module.exports = function(spell, caster, target) {
    events.EventEmitter.call(this);
    
    this._spell     = spell;
    this._caster    = caster;
    this._target    = target;
    this._duration  = this._spell.getDuration();

    this._initialize();
};

_.extend(SpellAffect.prototype, events.EventEmitter.prototype, {    
     getSpell:  function() { return this._spell; },
     getCaster: function() { return this._caster; },
     getTarget: function() { return this._target; },
     
     getCasterEventMessage: function(type) {
         return this._display[type].caster;
     },
     
     getTargetEventMessage: function(type) {
         return this._display[type].target;
     },
     
    _initialize: function() {
        var self = this;

        this._prepDisplay();

        this._caster.spellCasted(this);
        this._target.spellTargeted(this);

        if (this._duration) {
            var period          = this._duration.period;
            var tics            = this._duration.tics;
            if (tics && tics > 0) {
                if (this._duration.triggerOnLand) {
                    this._triggerSpell();
                }
                this._tics = tics;
                this._ticsPassed = 0;                
                this._interval = setInterval(function() {
                    self._onInterval();                    
                }, period);

            } else {
                this._timeout = setTimeout(self._onTimeout, period);
            }
        } else {
            //instant 
        }
    },

    _prepDisplay: function() {
        var self = this;
        var display = JSON.parse(JSON.stringify(this._spell.getDisplay())); // deep clone
        
        _.each(display, function(val, key, list) {
            _.each(val, function(v, k) {
                v.message = v.message.replace("%c", self._caster.getName()).replace("%t", self._target.getName());
            });
        });
        
        this._display = display;
    },

    refreshDuration: function() {                          
        var self            = this;                          
        this._ticsPassed    = 0;

        if (this._timeout) {
            this.stop();
            this._timeout = setTimeout(self._onTimeout, this._duration.period);
        }    
    },                          

    _onTimeout: function() {
        if (this._duration.triggerOnFade) {
            this._triggerSpell();
        }
        this.clear();
    },                    

    _onInterval: function() {
        if (this._ticsPassed < this._tics) {
            this._triggerSpell();
            this._ticsPassed++;
        } else {
            this.clear();
        }
    },  
    
    stop: function() {
        if (this._timeout) {
           clearTimeout(this._timeout);
        }
        if (this._interval) {
           clearInterval(this._interval);
        }
    },

    clear: function() {
        this.emit("faded");
        this.stop();
    },    

    _triggerSpell: function() {
        this.emit("periodic");
        
        var affects     = this._spell.getAffects(),
            spellAffect = this;
        
        _.each(affects, function(val, key, list) {
            if (key == "hitpoints") {
                if (val < 0) {
                    //damage
                    spellAffect.emit("damaged", Math.abs(val));
                } else {
                    //heal (TODO)
                    
                }
            }
        });                
    }
});

