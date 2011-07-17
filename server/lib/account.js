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
    this._musicOn               = attributes["musicOn"];
    this._score                 = attributes["score"] || 0;
    this._client                = null;
    this._player                = new Player(attributes);
};                          

Account.initFromSession = function(sessionId, callback) {
    var redis = Persistence.getRedis();
    redis.get(sessionId, function(err, data) {
        var sessionData = JSON.parse(data);
        if (sessionData.accountId) {
            account = Account.findById(sessionData.accountId, callback);
        } else {
            var guestUsername = "guest_" + sessionId.toString().substring(0,3);
            account = new Account({
                "username": guestUsername
            });
            callback(account);
        }
    });
};

Account.createViaFacebook = function(attributes, callback) {
    var redis = Persistence.getRedis();
    redis.incr( 'pkid' , function( err, newUserId ) {
        var account = new Account({
            "id"       : newUserId,
            "musicOn"  : true,
            "username" : attributes["username"]
        });
        account.save(function(){
            redis.set( 'facebookUser:'+attributes["facebookUserId"], account.getId(), function() {
                console.log("SAVED NEW USER AND MAPPED FB ID " + attributes["facebookUserId"] + "TO USER ID " + account.getId());
                callback(account);
            });
        });
    });
};

Account.findByFacebookId = function(facebookUserId, callback){
    var redis = Persistence.getRedis();
    redis.get("facebookUser:" + facebookUserId, function(err, data) {
       if (data) {
          Account.findById(data, function(account){
              callback(account);
          });
       } else {
           callback(null);
       }
    });
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

Account.findById = function(id, callback) {
    var redis = Persistence.getRedis();
    redis.get("account:" + id, function(err, data) {
        var account = null;
        if (data) {
            account = new Account(JSON.parse(data));
        }
        callback(account);
    });
};

_.extend(Account.prototype, events.EventEmitter.prototype, {
    save: function(callback){
        if (callback === undefined ) { callback = function(){}; }
        Persistence.getRedis().set('account:'+this._id, this.serialize(), callback);
    },
    
    serialize: function() {
        var player = this.getPlayer();
        console.log("\n\n\n\n\n\n" + player.getZoneId());
        return JSON.stringify({
            "id"                  : this._id,
            "musicOn"             : this._musicOn,
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

    getUsername: function() {
        return this._username;
    },
    
    setSoundOn: function(bool) {
        this._musicOn = bool;
    },
    
    isMusicOn: function() {
        return this._musicOn;
    },
    
    getScore: function() {
        return this._score;
    },
    
    kick: function() {
      this._client.onDisconnect();
    },
    
    addScore: function(amount) {
        this._score += amount;
        this.save();
        this.emit("changeScore", this._score);
        return this._score;
    }    
});


