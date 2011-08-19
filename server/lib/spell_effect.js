var _       = require("underscore"),
    events  = require("events");

var SpellEffect = module.exports = function(spell, caster, target) {
    events.EventEmitter.call(this);

    this._spell     = spell;
    this._caster    = caster;
    this._target    = target;

    this._initialize();
};

_.extend(SpellEffect.prototype, events.EventEmitter.prototype, {    
    getSpell:  function() { return this._spell; },
    getCaster: function() { return this._caster; },
    getTarget: function() { return this._target; },

    getCasterEventMessage: function(type) {
        try {
            return this._display[type].caster;
        }
        catch (ex) {
            return null;
        }
    },

    getTargetEventMessage: function(type) {
        try {
            return this._display[type].target;
        }
        catch (ex) {
            return null;
        }
    },

    refresh: function() {
        var duration = this._spell.getDuration();

        if (duration.refreshable) {
            this.stop();
            this._startTimeout();
        }
    },

    _resetTics: function() {
        this._ticsPassed = 0;
    },

    _startTimeout: function() {
        this._timeout = setTimeout(_(this._onTimeout).bind(this), this._spell.getDuration().period);
    },

    _startInterval: function() {
        this._interval = setInterval(_(this._onInterval).bind(this), this._spell.getDuration().period);
    },

    _initialize: function() {
        var duration    = this._spell.getDuration(),
            spellEffect = this;

        this._prepDisplay();

        this._caster.spellCasted(this);
        this._target.spellTargeted(this);

        this._target.on("unspawn", function() {
            spellEffect.complete();
        });
        
        if (duration) {
            var period  = duration.period,
                tics    = duration.tics;

            if (tics && tics > 0) {
                if (duration.triggerOnLand) {
                    this._triggerSpell();
                }

                this._tics = tics;

                this._resetTics();
                this._startInterval();                

            } else {
                this._startTimeout();
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

    _onTimeout: function() {
        var duration = this._spell.getDuration();

        if (duration.triggerOnFade) {
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
        this._resetTics();

        if (this._timeout) {
            clearTimeout(this._timeout);
        }

        if (this._interval) {
            clearInterval(this._interval);
        }
    },

    fade: function() {
        this.emit("faded");
        this.clear();
    },
    
    clear: function() {
        this.emit("removed");
        this.stop();
    },

    complete: function() {
        this.clear();
        this.emit("completed");
        
        this._destroy();
    },
    
    _destroy: function() {
        var spellEffect = this;
        
        _(["completed", "removed", "faded", "periodic", "damaged"]).each(function(eventName) {
            spellEffect.removeAllListeners(eventName);
        });
    },

    _triggerSpell: function() {
        this.emit("periodic");

        var effects     = this._spell.getEffects(),
            spellEffect = this;

        _.each(effects, function(val, key, list) {

            if (key == "hitpoints") {
                if (val < 0) {
                    //damage
                    spellEffect.emit("damaged", Math.abs(val));
                } else {
                    //heal (TODO)

                }
            }
        });                
    }
});

