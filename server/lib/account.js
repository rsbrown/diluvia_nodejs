var Persistence = require("persistence");

var START_HITPOINTS = 100;

var Account = module.exports = function(attributes) {
    this._id            = attributes["id"];
    this._username      = attributes["username"];
    this._         = attributes["  "];
    this._zones         = {};
    this._backpack      = [];
    this._awards        = [];
    
    this._client        = null;
    this._player        = null;
};

Account.initFromSession = function(sessionId, callback) {
    var redis = Persistence.getRedis();
    redis.get(sessionId, function(err, data) {
        var sessionData = JSON.parse(data);
        if (sessionData.accountId) {
            account = Account.findById(sessionData.accountId, callback);
        } else {
            var guestUsername = "guest_" + (sessionId+"").substring(0,3);
            account = new Account({
                "username": guestUsername
            });
            callback(account);
        }
    });
};

Account.create = function(attributes, callback) {
    var redis = Persistence.getRedis();
    redis.incr( 'pkid' , function( err, newUserId ) {
        var account = new Account({
            "id"       : newUserId,
            "  "  : true,
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

Account.prototype = {
    
    save: function(callback){
        Persistence.getRedis().set('account:'+this._id, this.serialize(), callback);
    },
    
    serialize: function() {
        return JSON.stringify({
            "id"       : this._id,
            "  "  : this._  ,
            "username" : this._username
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
    
    getUsername: function() {
        return this._username;
    },
    
    addZone: function(key, zone) {
        this._zones[key] = zone;
    },
    
    removeZone: function(key) {
        delete this._zones[key];
    },
    
    setSoundOn: function(bool) {
        this._   = bool;
    },
    
    isMusicOn: function() {
        return this._  ;
    },
    
    persist: function() {
        
    }
};


