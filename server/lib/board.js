var _       = require("underscore"),
    events  = require("events");
    
var Board = module.exports = function(zone) {
    this._layers    = [];
    this._zone      = zone;
    
    events.EventEmitter.call(this);
};

_(Board.prototype).extend(events.EventEmitter.prototype, {
    addLayer: function(layer) {
        var self        = this,
            layerIndex  = this._layers.length;
        
        layer.on("tileIdChange", function(tileIndex, tileId, prevTileId) {
            self.emit("layerTileIdChange", layerIndex, tileIndex, tileId, prevTileId);            
        });
        
        layer.on("tileDataChange", function(tileIndex, tileData, prevTileId) {
            self.emit("layerTileDataChange", layerIndex, tileIndex, tileData, prevTileId);
        });
        
        this._layers.push(layer);
        
        return layerIndex;
    },
    
    getLayer: function(layerIndex) {
        return this._layers[layerIndex];
    },
    
    getLayers: function() {
        return this._layers;
    },
    
    getTileIdAndDataFor: function(tileIndex) {
        return _(this._layers).map(function (layer) { return [ layer.getTileId(tileIndex), layer.getTileData(tileIndex) ] });
    },
        
    getRenderAttributes: function() {
        var state = {};
        
        for (var i = 0, len = this._layers.length; i < len; i++) {
            state[i] = this._layers[i].getRenderAttributes();
        }
        
        return state;
    }
});
