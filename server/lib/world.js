var Defs        = require("defs"),
    Zone        = require("zone"),
    Tile        = require("tile"),
    SpawnTile   = require("spawn_tile");

var World = module.exports = function() {
    this._accounts = [];
};


var defaultZone = new Zone(64, 64),
    defaultTile = new Tile({
        image: Defs.Images.baseTile
    }),
    spawnTile   = new SpawnTile();
    
var defaultTileIdx = defaultZone.addTile(defaultTile);
var spawnTileIdx   = defaultZone.addTile(spawnTile);

for (var i = 0; i < (64 * 64); i++) {
    defaultZone.setLayerTile(0, i, defaultTileIdx);
}

defaultZone.setLayerTile(1, 64, spawnTileIdx);

World.prototype = {
    addAccount: function(account) {
        this._accounts.push(account);
        
        account.setCurrentZone(defaultZone);
        defaultZone.addAccount(account);
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