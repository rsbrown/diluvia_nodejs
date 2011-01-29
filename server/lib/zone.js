var ActorTile       = require("actor_tile");

var LAYER_COUNT     = 3,
    BASE_LAYER      = 0,
    OBJECT_LAYER    = 1,
    ACTOR_LAYER     = 2;
    
var Zone = module.exports = function(width, height) {
    this._layers        = [];
    this._tiles         = [];
    this._dimensions    = [width, height];
    
    // initialize layers
    for (var i = 0; i < LAYER_COUNT; i++) {
        this._layers[i] = [];
    }
};

Zone.prototype = {
    getSpawnPointIndex: function() {
        var layer = this._layers[OBJECT_LAYER];
        
        for (var i = 0, len = layer.length; i < len; i++) {
            var tile = layer[i];
            
            if (tile.spawnPoint) {
                return i;
            }
        }
    },
    
    getAccountTile: function(account) {
        var layer = this._layers[ACTOR_LAYER];
        
        for (var i = 0, len = layer.length; i < len; i++) {
            var tile = layer[i];
            
            if (tile.account == account) {
                return tile;
            }
        }
    },
    
    addAccount: function(account) {
        var tile    = new ActorTile(),
            spawn   = this.getSpawnPointIndex(),
            tileIdx = this.addTile(tile),
            cli     = account.getClient();
        
        this.setLayerTile(ACTOR_LAYER, tileIdx, spawn);
        
        cli.sendZoneData(this);
        cli.sendZoneState(this);
        
        return tile;
    },
    
    setLayerTile: function(layer, layerIdx, tileIdx) {
        this._layers[layer][layerIdx] = tileIdx;
        return layer;
    },
    
    getLayerTile: function(layer, layerIdx) {
        return this._layers[layer][layerIdx];
    },
    
    getLayers: function() {
        return this._layers;
    },
    
    getTiles: function() {
        return this._tiles;
    },
    
    addTile: function(tile) {
        var idx = this._tiles.length;
        this._tiles.push(tile);
        return idx;
    },
    
    getTile: function(idx) {
        return this._tiles[idx];
    } 
};