const SOCKET_OPTIONS = {
  'connect timeout': 2000,
  'transports': [ 
                    'websocket'
                   ,'flashsocket'
                   // ,'htmlfile'
                   // ,'xhr-multipart' 
                   ,'xhr-polling'
                   // ,'jsonp-polling'
                  ],
  'try multiple transports': true
};

var Protocol = function(controller) {
    var self            = this;
    
    this._controller    = controller;
    this._socket        = io.connect(SOCKET_URI, SOCKET_OPTIONS);
    this._zoneData      = {};

    this._socket.on("connect", function() {
        self._handshake();
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
    });

};

Protocol.prototype = {
    _handshake: function() {
        this.send({ type: "Handshake", sessionId: DILUVIA_SESSION || null });
    },
    
    send: function(msg) {
      this._socket.json.send(msg);
    },
    
    parseMessage: function(msg) {
        var self = this;
        if (msg) {
            if (msg.type == "InitZoneData") {
                self._controller.initZoneData(msg.attrs);
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
    setZoneData: function(d) { this._zoneData = d; },
    getZoneState: function() { return this._zoneState; },
};
