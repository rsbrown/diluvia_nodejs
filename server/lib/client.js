var _       = require("underscore"),
    Defs    = require("defs"),
    Persistence = require("persistence"),
    events  = require("events");

var Client = module.exports = function(conn) {
    events.EventEmitter.call(this);
    
    this._conn          = conn;
    this._handshake     = false;
    this._startTime     = new Date();
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
            start_time: this._startTime,
            length:  (new Date().getTime() - this._startTime.getTime())/1000
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
    
    sendScoreUpdate: function(score) {
        this.sendMessage("ScoreUpdate", score);
    },
    
    sendScoreData: function(scoreData) {
        this.sendMessage("ScoreData", scoreData);
    },
    
    sendPlaySound: function(sound) {
        this.sendMessage("PlaySound", sound);
    },
    
    sendFlash: function(color) {
        this.sendMessage("Flash", color);
    },
    
    sendChat: function(color, message) {
        this.sendMessage("Chat", { color: color, text: message });
    },
    
    sendMessage: function(type, attrs) {
        this._conn.send({ "type": type, "attrs": attrs });
    },
});

