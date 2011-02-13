var _ = require("underscore");

var SpellAffect = module.exports = function(spell, caster, target) {    
    this._spell     = spell;
    this._caster    = caster;
    this._target    = target;
    this._duration  = this._spell.getDuration();

    this._initialize();
};

SpellAffect.prototype = {
    _initialize: function() {
        var self = this;

        this._prepDisplay();

        this._sendSpellMessages("cast");

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
        var display = _.clone(this._spell.getDisplay());
        _.each(display, function(val, key, list) {
            _.each(val, function(v, k) {
                v.message = v.message.replace("%c", self._caster.getName()).replace("%t", self._target.getName());
            });
            
        });
        this._display = display;
    },

    _getSpellMessages: function(type) {
        var msgs = {};

        if (this._display[type]) {
            msgs.caster = this._display[type].caster;
            msgs.target = this._display[type].target;
        }

        return msgs;
    },

    _sendSpellMessages: function(type) {
        var msgs = this._getSpellMessages(type);

        if (msgs) {
            var c = msgs.caster;
            
            if (c) {
                this._caster.emit("spellMessage", c.message, c.flash); 
            }
            
            var t = msgs.target;
            
            if (t) {
                this._target.emit("spellMessage", t.message, t.flash);
            }
        }
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
        this._sendSpellMessages("fade");
        this.stop();
        this._target.removeSpellAffect(this._spell.getName());
    },               

    _triggerSpell: function() {
        this._sendSpellMessages("periodic");

        var effects = this._spell.getEffects();

        var self = this;
        _.each(effects, function(val, key, list) {
            if (key == "hitpoints") {
                if (val < 0) {
                    //damage
                    self._target.takeSpellDamage(self._spell.getName(), Math.abs(val), self._caster, self._getSpellMessages("death"));
                } else {
                    //heal

                }
            }
        });                
    },
              
    getCaster: function() {
        return this._caster;
    }
};

