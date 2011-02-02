var _       = require("underscore"),
    Defs    = require("defs"),
    events  = require("events");

var Client = module.exports = function(conn) {
    events.EventEmitter.call(this);
    
    this._conn          = conn;
    this._handshake     = false;
};

_.extend(Client.prototype, events.EventEmitter.prototype, {
    onMessage: function(msg) {
        if (msg) {
            console.log("MESSAGE: " + JSON.stringify(msg));
            
            if (this._handshake) {
                if (msg.type == "Command") {
                    this.emit("receivedCommand", msg.command);
                }
                else if (msg.type == "Chat") {
                    this.emit("receivedChat", msg.text);
                }
            }
            else {
                if (msg.type == "Handshake") {                    
                    this.emit("receivedHandshakeRequest", msg.sessionId);
                }
            }
        }
    },

    completeHandshake: function() {
        this._handshake = true;
    },
    
    onDisconnect: function() {
        this.emit("disconnect");
    },
    
    sendZoneData: function(zone) {
        this.sendMessage("ZoneData", zone.getRenderAttributes());
    },
    
    sendZoneState: function(zoneState) {
        this.sendMessage("ZoneState", zoneState);
    },
    
    sendPlaySound: function(sound) {
        this.sendMessage("PlaySound", sound);
    },
    
    sendFlash: function(color) {
        this.sendMessage("Flash", color);
    },
    
    sendChat: function(message) {
        this.sendMessage("Chat", message);
    },
    
    sendMessage: function(type, attrs) {
        this._conn.send({ "type": type, "attrs": attrs });
    },
});

