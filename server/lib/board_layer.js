var _       = require("underscore"),
    events  = require("events");
    
var BoardLayer = module.exports = function(layerIndex) {
    this._tiles      = [];
    this._tileData   = {};
    this._layerIndex = layerIndex;
    
    events.EventEmitter.call(this);
};

_.extend(BoardLayer.prototype, events.EventEmitter.prototype, {
    pushTile: function(tileIndex, tileData) {
        if (!this._tiles[tileIndex]) {
            this._tiles[tileIndex] = [];
        }
        
        this._tiles[tileIndex].push(tileData);
        this.emit("tileChange", tileIndex, this._tiles[tileIndex]);
    },
    
    clearTile: function(tileIndex) {
        delete this._tiles[tileIndex];
        this.emit("tileChange", tileIndex, this._tiles);
    },

    popTile: function(tileIndex, tileData) {
        var tiles           = this._tiles[tileIndex],
            tileDataJSON    = JSON.stringify(tileData),
            spliceIdx       = -1;
                
        if (tiles && tiles.length > 0) {
            for (var i = 0, len = tiles.length; i < len; i++) {
                var otherJSON = JSON.stringify(tiles[i]);
                            
                if (otherJSON == tileDataJSON) {
                    tiles.splice(i, 1);
                    break;
                }
            }
        }

        if (tiles && tiles.length == 0) {
            delete this._tiles[tileIndex];
        }
        
        this.emit("tileChange", tileIndex, tiles);
    },
    
    getLayerIndex: function() {
      return this._layerIndex;
    },
    
    getTiles: function(tileIndex) {
        return this._tiles[tileIndex];
    },
    
    eachTile: function(iterator) {
        for (var key in this._tiles) {
            iterator(key, this._tiles[key]);
        }
    },
    
    getRenderAttributes: function() {
        return this._tiles;
    }
});


