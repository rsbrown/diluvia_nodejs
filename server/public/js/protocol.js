
var Protocol = function(controller, server, options) {
    var self            = this;
    
    this._controller    = controller;
    this._socket        = new io.Socket(server, options);
    
    this._zoneData      = {};

    this._socket.connect();

    this._socket.on("connect", function() {
        
    });

    this._socket.on("message", function(msg) {
        self._parseMessage(msg);
    });

    this._socket.on("disconnect", function() {
        
    });

};

Protocol.prototype = {
    send: function(msg) {
        this._socket.send(msg);
    },
    
    _parseMessage: function(msg) {
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
                console.log("playing sound");
                self._controller.getSound().playAudio("bump");
            }
            else if (msg.type == "PlaySound") {
                var sound = self._controller.getSound();
                sound.playAudio(msg.attrs);
            }
            else if (msg.type == "Chat") {
                self._controller.displayChatMessage(msg.attrs);
            }
        }
    },
    
    getZoneData: function() { return this._zoneData; },
    getZoneState: function() { return this._zoneState; }
};
