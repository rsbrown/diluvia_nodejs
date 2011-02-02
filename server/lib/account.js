var START_HITPOINTS = 100;
var uidCounter      = 0;

var Account = module.exports = function(world, options) {
    options             = options || {};
    
    this._world         = world;
    this._uid           = uidCounter++;
    
    this._zones         = {};
    this._backpack      = [];
    this._awards        = [];
    
    this._client        = null;
    this._player        = null;
    
};

Account.prototype = {
    getPlayer: function() {
        return this._player;
    },
    
    setPlayer: function(player) {
        this._player = player;
    },
    
    getClient: function() {
        return this._client;
    },
    
    setClient: function(client) {
        this._client = client;
    },
    
    getUid: function() {
        return this._uid;
    },
    
    addZone: function(key, zone) {
        this._zones[key] = zone;
    },
    
    removeZone: function(key) {
        delete this._zones[key];
    }
};


