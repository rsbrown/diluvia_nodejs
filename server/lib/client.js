var _       = require("underscore"),
    Defs    = require("defs"),
    Persistence = require("persistence"),
    events  = require("events");

var Client = module.exports = function(conn) {
    events.EventEmitter.call(this);
    
    this._conn          = conn;
    this._account       = null;
    this._handshake     = false;
    this._startTime     = new Date();
};

_.extend(Client.prototype, events.EventEmitter.prototype, {
    setAccount: function(acct) {
        this._account = acct;
    },

    getAccount: function() {
        return this._account;
    },
    
    onMessage: function(msg) {
        if (msg) {
            //console.log("MESSAGE: " + JSON.stringify(msg));
            
            if (this._handshake) {
                if (msg.type == "StartGame") {
                    this.emit("startGame");
                }
                else if (msg.type == "InitWorldView") {
                    this.emit("initWorldView");
                }
                else if (msg.type == "Command") {
                    this.emit("receivedCommand", msg.command);
                }
                else if (msg.type == "CenterEditorView") {
                    this.emit("centerEditorView", msg.index);
                }
                else if (msg.type == "SwitchZone") {
                    this.emit("switchZone", msg.zone_id);
                }
                else if (msg.type == "EditTile") {
                    this.emit("editTile", msg);
                }
                else if (msg.type == "SaveZone") {
                    this.emit("saveZone", msg.zoneId, msg.zoneData);
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
    
    composeZoneStateFor: function(zoneState) {
        return {
            "viewCenterIdx":    this._account.getCenterViewTileIndex(),
            "layers":           zoneState
        };
    },

    completeHandshake: function(serverInfo) {
        this._handshake = true;
        this.sendMessage("CompleteHandshake", serverInfo);
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
    
    initZoneData: function(zone) {
        var initialZoneState = this.composeZoneStateFor(zone.getStateAttributes())
        this.sendMessage("InitZoneData", {
          "ZoneTiles":   zone.getRenderAttributes(),
          "ZoneLayout":  initialZoneState
        });
    },
    
    updateZoneState: function(zoneState) {
        this.sendMessage("ZoneState", this.composeZoneStateFor(zoneState));
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
        this._conn.json.send({ "type": type, "attrs": attrs });
    },
});

