var Persistence = require("persistence");

var START_HITPOINTS = 100;

var Account = module.exports = function(world, sessionId) {
    this._uid           = null;
    this._world         = world;
    
    this._zones         = {};
    this._backpack      = [];
    this._awards        = [];
    
    this._client        = null;
    this._player        = null;
    
    this.initSession(sessionId);
};

Account.prototype = {

    initSession: function(sessionId) {
      var self = this,
          redis = Persistence.getRedis();
        
      redis.get(sessionId, function(err, data) {
         var sessionData = JSON.parse(data);
         if (sessionData.username) {
             self._uid = sessionData.username;
         } else {
             self._uid = "guest_" + (sessionId+"").substring(0,3);
         }
        console.log("INIT SESSION FOR USER " + self._uid);
      });
    },

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


