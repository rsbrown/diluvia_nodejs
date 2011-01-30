var Defs        = require("defs"),
    Zone        = require("zone"),
    Tile        = require("tile"),
    SpawnTile   = require("spawn_tile");

var World = module.exports = function(defaultZone) {
    this._accounts      = [];
    this._defaultTiles  = [];    
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
    
    emptyZone: function(width, height) {
        return new Zone(width || 64, height || 64);
    },
    
    generateDefaultZone: function() {
        var zone    = this.emptyZone(),
            dims    = zone.getDimensions(),
            tileCnt = dims[0] * dims[1];

        for (var i = 0; i < tileCnt; i++) {
            zone.setLayerTile(0, i, "BASE_GRASS");
        }

        zone.setLayerTile(1, 64, "SPAWN");

        return zone;
    }
};