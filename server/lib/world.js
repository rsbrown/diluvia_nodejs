var Defs        = require("defs"),
    Zone        = require("zone"),
    Tile        = require("tile"),
    SpawnTile   = require("spawn_tile");

var World = module.exports = function() {
    this._accounts      = [];
    this._defaultTiles  = [];
    this._zones         = {};
};

World.DEFAULT_ZONE_ID = "zones:0";

World.prototype = {
    setDefaultZone: function(zone) {
        this._zones[World.DEFAULT_ZONE_ID] = zone;
    },
    
    getDefaultZone: function() {
        return this._zones[World.DEFAULT_ZONE_ID];
    },
    
    setZone: function(zoneId, zone) {
        if (zone) {
            this._zones[zoneId] = zone;
        }
        else {
            delete this._zones[zoneId];
        }
    },
    
    getZone: function(zoneId) {
        return this._zones[zoneId];
    },
    
    addAccount: function(account) {
        this._accounts.push(account);
        account.setCurrentZone(this.getDefaultZone());
        this.getDefaultZone().addAccount(account);
    },
    
    removeAccount: function(account) {
        
    },
    
    teleport: function(account, zoneId) {
        var oldZone     = account.getCurrentZone(),
            newZone     = this.getZone(zoneId);
        
        oldZone.removeAccount(account);
        account.setCurrentZone(newZone);
        newZone.addAccount(account);
    },
    
    emptyZone: function(width, height) {
        return new Zone(width || 64, height || 64);
    },
    
    generateDefaultZone: function(options) {
        var options = options || {},
            zone    = this.emptyZone(options.width, options.height),
            dims    = zone.getDimensions(),
            tileCnt = dims[0] * dims[1];

        for (var i = 0; i < tileCnt; i++) {
            zone.setLayerTile(0, i, options.baseTile || "BASE_GRASS");
        }

        zone.setLayerTile(1, 64, "SPAWN");

        return zone;
    }
};