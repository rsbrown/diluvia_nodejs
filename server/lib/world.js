var Defs        = require("defs"),
    Zone        = require("zone"),
    Tile        = require("tile"),
    SpawnTile   = require("spawn_tile");

var World = module.exports = function(defaultZone) {
    this._accounts = [];
};

World.prototype = {
    setDefaultZone: function(zone) {
      this._defaultZone = zone;
    },
    addAccount: function(account) {
        this._accounts.push(account);
        account.setCurrentZone(this._defaultZone);
        this._defaultZone.addAccount(account);
    },
    
    removeAccount: function(account) {
        
    },
    
    tick: function() {
        return this._ticks + 1;
    },
    
    getTicks: function() {
        return this._ticks;
    },
};