var START_HITPOINTS = 100;
var UID_COUNTER     = 0;

var Account = module.exports = function(options) {
    options             = options || {};
    
    this._uid           = UID_COUNTER++;
    
    this._username      = options.username;
    this._password      = options.password;
    
    this._zones         = [];
    this._backpack      = [];
    this._awards        = [];
    
    this._currentZone   = null;
    
    this._hitpoints     = START_HITPOINTS;
};

Account.prototype = {
    setCurrentZone: function(zone) {
        this._currentZone = zone;
    },
    
    getCurrentZone: function() {
        return this._currentZone; 
    },
    
    addToBackpack: function(item) {
        // TODO
    },
    
    removeFromBackpack: function(item) {
        // TODO
    },
    
    addAward: function(item) {
        // TODO
    },
    
    getAwards: function() {
        // TODO
    },
    
    takeDamage: function(amount) {
        
    },
    
    setClient: function(client) {
        this._client = client;
    },
    
    getClient: function() {
        return this._client;
    }
};


