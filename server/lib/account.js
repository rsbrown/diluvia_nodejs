var START_HITPOINTS = 100;
var uidCounter      = 0;

var Account = module.exports = function(options) {
    options             = options || {};
    
    this._uid           = uidCounter++;
    
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
    
    getLayerTileIndex: function() {
        return this._currentZone.getAccountLayerTileIndex(this);
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
    },
    
    onStart: function(command) {
        this._currentZone.startCommand(this, command);
    },
    
    onEnd: function(command) {
        this._currentZone.stopCommand(this, command);
    },
    
    getUid: function() {
        return this._uid;
    },
    
    shouldUpdateZone: function(lastUpdated) {
        return this._currentZone.hasUpdatedSince(lastUpdated);
    }
};


