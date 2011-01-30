var START_HITPOINTS = 100;
var uidCounter      = 0;

var Account = module.exports = function(world, options) {
    options             = options || {};
    
    this._world         = world;
    this._uid           = uidCounter++;
    
    this._username      = options.username;
    this._password      = options.password;
    
    this._zones         = [];
    this._backpack      = [];
    this._awards        = [];
    
    this._currentZone   = null;
    
    this._hitpoints     = START_HITPOINTS;
    
    this._queue         = [];
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
    
    teleport: function(zoneId) {
        this._world.teleport(this, zoneId);
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
        if (client == null) {
            this._currentZone.removeAccount(this);
        }
        
        this._client = client;
    },
    
    getClient: function() {
        return this._client;
    },
    
    onCommand: function(command) {
        this._currentZone.runCommand(this, command);
    },
    
    onStart: function(command) {
        this._currentZone.startCommand(this, command);
    },
    
    onEnd: function(command) {
        this._currentZone.stopCommand(this, command);
    },
    
    move: function(command) {
        if (command == "n" || command == "s" || command == "e" || command == "w") {
            dir = command;
        }

        if (dir) {
            this._currentZone.move(this, dir);
            this._currentZone.moveClient();
        }
    },
    
    getUid: function() {
        return this._uid;
    },
    
    shouldUpdateZone: function(lastUpdated) {
        return this._currentZone.hasUpdatedSince(lastUpdated);
    },
    
    sendMessage: function(msg) {
        this._queue.push(msg);
    },
    
    flushSendQueue: function() {
        for (var i = 0, len = this._queue.length; i < len; i++) {
            this._client.send(this._queue[i]);
        }
        
        this._queue = [];
    },
};


