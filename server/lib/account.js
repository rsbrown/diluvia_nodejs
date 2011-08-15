var _           = require("underscore"),
    Player      = require("player"),
    Persistence = require("persistence"),
    events      = require("events");

var START_HITPOINTS = 100;

var Account = module.exports = function(attributes) {
    events.EventEmitter.call(this);
    this._id                    = attributes["id"];
    this.id                     = this._id;
    this._username              = attributes["username"];
    this._islandZoneId          = attributes["islandZoneId"];
    this._editorZoneId          = attributes["editorZoneId"] ? attributes["editorZoneId"] : this._islandZoneId;
    this._name                  = attributes["name"];
    this._email                 = attributes["email"];
    this._score                 = attributes["score"] || 0;
    this._client                = null;
    this._player                = new Player(attributes);
};                          

Account.initFromSession = function(sessionId, callback) {
    var redis = Persistence.getRedis();
    redis.get(sessionId, function(err, data) {
        var sessionData = JSON.parse(data);
        if (sessionData && sessionData.accountId) {
            Account.findById(sessionData.accountId, function(account){
              account.startInZone(sessionData.startZoneId);
              callback(account);
            });
        } else {
            var guestUsername = "guest_" + sessionId.toString().substring(0,3);
            account = new Account({
                "username": guestUsername
            });
            account.startInZone(sessionData ? sessionData.startZoneId : null);
            callback(account);
        }
    });
};

Account.createViaJanrain = function(janrainProfile, callback) {
    var redis = Persistence.getRedis();
    var janrainId = janrainProfile.identifier;
    redis.incr( 'pkid' , function( err, newUserId ) {
      var newAccount = new Account({
          "id"       : newUserId,
          "name"     : janrainProfile.name.givenName,
          "username" : janrainProfile.preferredUsername,
          "email"    : janrainProfile.email
      });
      newAccount.save(function(){
          redis.set( 'janrainUser:'+janrainId, newAccount.getId(), function() {
              console.log("SAVED NEW USER AND MAPPED JANRAIN ID " + janrainId + "TO USER ID " + newAccount.getId());
              callback(newAccount);
          });
      });
    });
};

Account.findByJanrainId = function(janrainUserId, callback){
    var redis = Persistence.getRedis();
    redis.get("janrainUser:" + janrainUserId, function(err, data) {
       if (data) {
          Account.findById(data, function(account){
              callback(account);
          });
       } else {
           callback(null);
       }
    });
};


Account.findById = function(id, callback) {
    if (id) {
      var redis = Persistence.getRedis();
      redis.get("account:" + id, function(err, data) {
          var account = null;
          if (data) {
              account = new Account(JSON.parse(data));
          }
          callback(account);
      });
    } else {
      callback(null);
    }
};

Account.findAll = function(callback) {
    var redis = Persistence.getRedis();
    var acctList = [];
    redis.keys("account:*", function (err, keys) {
        redis.mget(keys, function (err, accounts) {
            if (accounts) {
                accounts.forEach(function (data, index) {
                    var a = new Account(JSON.parse(data));
                    acctList[index] = a;
                });
            }
            callback(acctList);
        });
    });
};

_.extend(Account.prototype, events.EventEmitter.prototype, {
    save: function(callback){
        if (callback === undefined ) { callback = function(){}; }
        Persistence.getRedis().set('account:'+this._id, this.serialize(), callback);
    },
    
    serialize: function() {
        var player = this.getPlayer();
        return JSON.stringify({
            "id"                  : this._id,
            "email"               : this._email,
            "name"                : this._name,
            "username"            : this._username,
            "islandZoneId"        : this._islandZoneId,
            "editorZoneId"        : this._editorZoneId,
            "zoneIdx"             : player ? player.getZoneId() : null,
            "tileIdx"             : player ? player.getTileIndex() : null,
            "orientation"         : player ? player.getOrientation() : null,
            "score"               : this._score
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
    
    getId: function() {
        return this._id;
    },
    
    getIslandZoneId: function() {
        return this._islandZoneId;
    },
    
    setIslandZoneId: function(id) {
        this._islandZoneId = id;
    },
    
    getEditorZoneId: function() {
        return this._editorZoneId;
    },
    
    setEditorZoneId: function(id) {
        this._editorZoneId = id;
    },

    getEditorViewTileIndex: function() {
        return this._editorViewTileIndex;
    },
    
    setEditorViewTileIndex: function(idx) {
        this._editorViewTileIndex = idx;
    },
    
    getCenterViewTileIndex: function(idx) {
        return this._editorViewTileIndex ? this._editorViewTileIndex : this.getPlayer().getTileIndex();
    },
    
    setUsername: function(uName) { this._username = uName; },
    getUsername: function() { return this._username; },
    
    getScore: function() {
        return this._score;
    },
    
    kick: function() {
      this._client.onDisconnect();
    },
    
    startInZone: function(zoneId) {
      if (zoneId) {
        this.getPlayer().setZoneId(zoneId);
        this.getPlayer().setTileIndex(null);
      }
    },
    
    addScore: function(amount) {
        this._score += amount;
        this.save();
        this.emit("changeScore", this._score);
        return this._score;
    }    
});


