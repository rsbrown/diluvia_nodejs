var _       = require("underscore"),
    events  = require("events");
    
var BoardLayer = module.exports = function(board) {
    this._tiles     = {};
    this._tileData  = {};
    
    events.EventEmitter.call(this);
};

_.extend(BoardLayer.prototype, events.EventEmitter.prototype, {
    setTileId: function(tileIndex, tileId) {
        var prevTileId = this._tiles[tileIndex];
        
        if (tileId == null) {
            delete this._tiles[tileIndex];
            delete this._tileData[tileIndex];
        }
        else {
            this._tiles[tileIndex] = tileId;
        }   

        this.emit("tileIdChange", tileIndex, tileId, prevTileId);        
    },
    
    getTileId: function(tileIndex) {
        return this._tiles[tileIndex];
    },
    
    setTileData: function(tileIndex, tileData) {
        var prevTileData = this._tileData[tileIndex];
        
        if (tileData == null) {
            delete this._tileData[tileIndex];
        }
        else {
            this._tileData[tileIndex] = tileData;
        }
        
        this.emit("tileDataChange", tileIndex, tileData, prevTileData);
    },
    
    getTileData: function(tileIndex) {
        return this._tileData[tileIndex];
    },
    
    mergeTileData: function(tileIndex, tileData) {
        this.setTileData(tileIndex, _(this.getTileData(tileIndex)).extend(tileData));
    },
    
    shiftTile: function(prevTileIndex, nextTileIndex) {
        var prevTileId      = this.getTileId(prevTileIndex),
            prevTileData    = this.getTileData(prevTileIndex);
        
        this.setTileId(prevTileIndex, null);
        this.setTileData(prevTileIndex, null);
        
        this.setTileId(nextTileIndex, prevTileId);
        this.setTileData(nextTileIndex, prevTileData);
    },
    
    eachTile: function(iterator) {
        for (var key in this._tiles) {
            iterator(key, this._tiles[key], this._tileData[key]);
        }
    },
    
    getRenderAttributes: function() {
        var ret = {};
        
        for (var tileIndex in this._tiles) {
            var tileData    = this.getTileData(tileIndex),
                tileId      = this._tiles[tileIndex];
            
            if (tileData) {
                ret[tileIndex] = [ tileId, tileData ];
            }
            else {
                ret[tileIndex] = tileId;
            }
        }
        
        return ret;
    }
});


