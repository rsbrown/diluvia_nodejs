const RETRY_INTERVAL = 2000;
var timeout;

var Protocol = function(controller) {
    var self            = this;
    
    this._controller    = controller;
    this._socket        = io.connect(SOCKET_URI);
    this._zoneData      = {};

    this._socket.on("connect", function() {
        self._handshake();
        clearTimeout(timeout);
    });
    
    this._socket.on("reconnect", function() {
      $("#connection-lost").dialog('close');
    });

    this._socket.on("message", function(msg) {
        self.parseMessage(msg);
    });

    this._socket.on("disconnect", function() {
        $("#connection-lost").dialog({
            resizable: false,
            modal: true,
            closeOnEscape: false,
            open: function(event, ui) { $(".ui-dialog-titlebar-close").hide(); },
            buttons: {
                Cancel: function() {window.location.href = "/";}
            }
        });
        // self.retryConnectOnFailure(RETRY_INTERVAL);
    });

};

Protocol.prototype = {
    _handshake: function() {
        this.send({ type: "Handshake", sessionId: DILUVIA_SESSION || null });
    },
    
    send: function(msg) {
      this._socket.json.send(msg);
    },
    
    retryConnectOnFailure: function(retryInMilliseconds) {
        var self = this;
        
        setTimeout(function() {
            if (!connected) {
                self._socket = io.connect(SOCKET_URI);
                $.get('/ping', function(data) {
                    connected = true;
                    window.location.href = unescape(window.location.pathname);
                });
                self.retryConnectOnFailure(retryInMilliseconds);
            }
        }, retryInMilliseconds);
    },
    
    parseMessage: function(msg) {
        var self = this;
        if (msg) {
            if (msg.type == "ZoneData") {
                var zoneData = self._zoneData = msg.attrs,
                    tileData = zoneData.tiles;
                
                if (zoneData.background) {
                    self._controller.preloadImage(zoneData.background);
                }
                
                for (var key in tileData) {
                    var item        = tileData[key],
                        imgParts    = item.image.split(':'),
                        rowcol      = imgParts[1].split(',');
                                        
                    item.imagePath  = imgParts[0];
                    item.coords     = Diluvia.rowColToPixels(parseInt(rowcol[0]), parseInt(rowcol[1]));
                    
                    self._controller.preloadImage(item.imagePath);
                }
                
                self._controller.updateZoneData(zoneData);
            }
            else if (msg.type == "ZoneState")  {
                self._controller.updateZoneState(msg.attrs);
            }
            else if (msg.type == "MoveFailed") {
                self._controller.getSound().playAudio("bump");
            }
            else if (msg.type == "PlaySound") {
                var sound = self._controller.getSound();
                sound.playAudio(msg.attrs);
            }
            else if (msg.type == "Chat") {
                self._controller.displayChatMessage(msg.attrs);
            }
            else if (msg.type == "Flash") {
                self._controller.flash(msg.attrs);
            }
            else if (msg.type == "CompleteHandshake") {
                self._controller.completeHandshake(msg.attrs);
            }
            else if (msg.type == "ScoreUpdate") {
                self._controller.setScore(msg.attrs);
            }
            else if (msg.type == "ScoreData") {
                self._controller.updateScoreboard(msg.attrs);
            }
        }
    },
    
    getZoneData: function() { return this._zoneData; },
    getZoneState: function() { return this._zoneState; },
};
