var _            = require("underscore"),
    Defs         = require("defs"),
    BoardLayer   = require("board_layer");
    events       = require("events");
    
var Board = module.exports = function(zone) {
    this._layers    = [];
    this._zone      = zone;
    
    for (var i = 0; i < Defs.LAYER_COUNT; i++) {
        this.addLayer(new BoardLayer(i));
    }
    
    events.EventEmitter.call(this);
};

_(Board.prototype).extend(events.EventEmitter.prototype, {
    addLayer: function(layer) {
        var self        = this,
            layerIndex  = this._layers.length;
        
        layer.on("tileChange", function(tileIndex, tiles) {
            self.emit("layerTileChange", layerIndex, tileIndex, tiles);            
        });
        
        this._layers.push(layer);
        
        return layerIndex;
    },
    
    getLayer: function(layerIndex) {
        return this._layers[layerIndex];
    },
    
    getLayerIndexFor: function(layer) {
        return this._layers.indexOf(layer);
    },
    
    getLayers: function() {
        return this._layers;
    },
    
    getAllTilesFor: function(tileIndex) {
        var self = this;
        
        return _(this._layers).map(function (layer) { 
            return [ layer.getTiles(tileIndex), self.getLayerIndexFor(layer) ]; 
        });
    },
        
    getRenderAttributes: function() {
        var state = [];
        
        for (var i = 0, len = this._layers.length; i < len; i++) {
            state[i] = this._layers[i].getRenderAttributes();
        }
        
        return state;
    }
});
