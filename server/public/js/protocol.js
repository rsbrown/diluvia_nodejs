const RETRY_INTERVAL = 2000;
var timeout;

var Protocol = function(controller, server, options) {
    var self            = this;
    
    this._controller    = controller;
    this._server        = server;
    this._sock_options  = options;
    this._socket        = new io.Socket(this._server, this._sock_options);
    this._connected     = false;
    this._zoneData      = {};

    this._socket.connect();

    this._socket.on("connect", function() {
        self._handshake();
        this._connected = true;
        clearTimeout(timeout);
        $("#connection-lost").dialog('close');
    });

    this._socket.on("message", function(msg) {
        self.parseMessage(msg);
    });

    this._socket.on("disconnect", function() {
        connected = false;
        
        $("#connection-lost").dialog({
            resizable: false,
            modal: true,
            closeOnEscape: false,
            open: function(event, ui) { $(".ui-dialog-titlebar-close").hide(); },
            buttons: {
                Cancel: function() {window.location.href = "/";}
            }
        });
        self.retryConnectOnFailure(RETRY_INTERVAL);
    });

};

Protocol.prototype = {
    _handshake: function() {
        this.send({ type: "Handshake", sessionId: DILUVIA_SESSION || null });
    },
    
    send: function(msg) {
        this._socket.send(msg);
    },
    
    retryConnectOnFailure: function(retryInMilliseconds) {
        var self = this;
        
        setTimeout(function() {
            if (!connected) {
                self._socket = new io.Socket(this._server, this._sock_options);
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
            console.log(msg);
            
            if (msg.type == "ZoneData") {
                var zoneData = this._zoneData = msg.attrs,
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
                
                this._controller.updatedZoneData(zoneData);
            }
            else if (msg.type == "ZoneState")  {
                this._controller.updatedZoneState(msg.attrs);
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
            else if (msg.type == "ServerInfo") {
                self._controller.setServerInfo(msg.attrs);
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
