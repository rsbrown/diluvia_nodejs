
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
<<<<<<< HEAD
            //console.log(msg.type);
=======
            console.log(msg);
>>>>>>> de06dadc7530ca13f2c01b28e5400fa7e5930311
            
            if (msg.type == "ZoneData") {
                var zoneData = this._zoneData = msg.attrs;
                
                for (var key in zoneData) {
                    var item        = zoneData[key],
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
        }
    },
    
    getZoneData: function() { return this._zoneData; },
    getZoneState: function() { return this._zoneState; }
};
