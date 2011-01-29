var Defs = require("defs");

var Client = module.exports = function(conn, account) {
    var self = this;
    
    this._conn          = conn;
    this._account       = account;
    this._interval      = setInterval(function() { self._onInterval(); }, Defs.CLIENT_INTERVAL);
    this._lastUpdate    = 0;
    
    account.setClient(this);
};

Client.prototype = {
    _onInterval: function() {
        if (this._account.shouldUpdateZone(this._lastUpdate)) {
            this.sendZoneState(this._account.getCurrentZone());
            this._lastUpdate = new Date().getTime();
        }
    },
    
    onMessage: function(msg) {
        if (msg) {
            if (msg.type == "CommandStart") {
                this._account.onStart(msg.command);
            }
            else if (msg.type == "CommandEnd") {
                this._account.onEnd(msg.command);
            }
        }
    },
    
    onDisconnect: function() {
        
    },
    
    sendZoneData: function(zone) {
        var tiles       = zone.getTiles(),
            tileData    = {};

        for (var i = 0, len = tiles.length; i < len; i++) {
            var tile = tiles[i];
            
            tileData[i] = {
                image: tile.getImage()
            };
        }
                
        this.sendMessage("ZoneData", tileData);
    },
    
    sendZoneState: function(zone) {
        var layers      = zone.getLayers(),
            stateData   = {};

        for (var layerIdx = 0, layerLen = layers.length; layerIdx < layerLen; layerIdx++) {
            var layer   = layers[layerIdx],
                data    = {};
            
            for (var tileIdx in layer) {
                data[tileIdx] = layer[tileIdx];
            }
            
            stateData[layerIdx] = data;
        }
        
        this.sendMessage("ZoneState", stateData);
    },
    
    sendMessage: function(type, attrs) {
        this._conn.send({ "type": type, "attrs": attrs });
    },
};

