var redis = require("redis");

var PersistenceInstance = function() {
};

PersistenceInstance.prototype = {
    getRedis: function() {
        if (!this._redis) {
            this._redis = redis.createClient();
        }
        
        return this._redis;
    }
};

module.exports = new PersistenceInstance();