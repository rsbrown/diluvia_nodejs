var Client = module.exports = function(conn, account) {
    this._conn      = conn;
    this._account   = account;
    
    account.setClient(this);
};

Client.prototype = {
    onMessage: function(msg) {
        
    },
    
    onDisconnect: function() {
        
    },
    
    sendZoneData: function(zone) {
        var tiles       = zone.getTiles(),
            tileData    = {};
        
        for (var i = 0, len = tiles.length; len < i; i++) {
            var tile = tiles[i];
            
            tileData[i] = {
                image: tile.getImage()
            };
        }
        
        this._conn.send({
            type: "ZoneData",
            attrs: tileData            
        });
    },
    
    sendZoneState: function(zone) {
        var layers      = zone.getLayers(),
            stateData   = {};
        
        for (var layerIdx = 0, layerLen = layers.length; layerLen < layerIdx; layerIdx++) {
            var layer   = layers[layerIdx],
                data    = {};
            
            for (var tileIdx = 0, tileLen = layer.length; tileLen < tileIdx; tileIdx++) {                
                data[tileIdx] = layer[tileIdx];
            }
            
            stateData[layerIdx] = data;
        }
        
        this._conn.send({
            type: "ZoneState",
            attrs: stateData
        });
    }
};

