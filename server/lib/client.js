var Defs = require("defs");

var Client = module.exports = function(conn, account) {
    var self = this;
    
    this._conn          = conn;
    this._account       = account;
    this._lastUpdate    = 0;
    
    account.setClient(this);
};

Client.prototype = {
    onMessage: function(msg) {
        if (msg) {
            if (msg.type == "CommandStart") {
                this._account.onStart(msg.command);
            }
            else if (msg.type == "CommandEnd") {
                this._account.onEnd(msg.command);
            }
            else if (msg.type == "Move") {
                this._account.onCommand(msg.command);
            }
            else if (msg.type == "Command") {
                this._account.onCommand(msg.command);
            }
            else if (msg.type == "Chat") {
                this._account.onChat(msg.text);
            }
        }
    },
    
    onDisconnect: function() {
        this._account.setClient(null);
        clearInterval(this._interval);
    },
    
    sendZoneData: function(zone) {
        var tiles       = zone.getTiles(),
            tileData    = {};

        for (var key in tiles) {
            var tile = tiles[key];
            
            tileData[key] = {
                image: tile.getImage()
            };
        }
                
        this.sendMessage("ZoneData", {
            "background":   zone.getBackground(),
            "music":        zone.getMusic(),
            "tiles":        tileData
        });
    },
    
    sendMoveFailed: function() {
        this.sendMessage("MoveFailed", null);
    },
    
    sendPlaySound: function(sound) {
        this.sendMessage("PlaySound", sound);
    },
    
    sendFlash: function(color) {
        this.sendMessage("Flash", color);
    },
    
    sendZoneState: function(zone, layerState) {
        if (!layerState) {
            var layers      = zone.getLayers(),
                layerState  = {};

            for (var layerIdx = 0, layerLen = layers.length; layerIdx < layerLen; layerIdx++) {
                var layer   = layers[layerIdx],
                    data    = {};
            
                for (var tileIdx in layer) {
                    data[tileIdx] = layer[tileIdx];
                }
            
                layerState[layerIdx] = data;
            }
        }
        
        this.sendMessage("ZoneState", {
            "playerIdx":    this._account.getLayerTileIndex(),
            "dimensions":   this._account.getCurrentZone().getDimensions(),
            "layers":       layerState
        });
    },
    
    sendMessage: function(type, attrs) {
        this._conn.send({ "type": type, "attrs": attrs });
    },
};

