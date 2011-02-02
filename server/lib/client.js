var _       = require("underscore"),
    Defs    = require("defs"),
    Persistence = require("persistence"),
    events  = require("events");

var Client = module.exports = function(conn) {
    events.EventEmitter.call(this);
    
    this._conn          = conn;
    this._handshake     = false;
    this._startTime     = new Date().getTime();
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
        var redis = Persistence.getRedis();
        var sessionData = JSON.stringify({
            session: this._conn.sessionId,
            length:  (new Date().getTime() - this._startTime)/1000
        });
        redis.rpush("sessions", sessionData);
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

