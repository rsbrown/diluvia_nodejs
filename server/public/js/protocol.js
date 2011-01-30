
var Protocol = function(controller, server, options) {
    var self            = this;
    
    this._controller    = controller;
    this._socket        = new io.Socket(server, options);
    
    this._zoneData      = {};
    this._zoneState     = {};

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
            //console.log(msg);
            
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
                this._zoneState = msg.attrs;
                this._controller.updatedZoneState(this._zoneState);
            }
        }
    },
    
    getZoneData: function() { return this._zoneData; },
    getZoneState: function() { return this._zoneState; }
};
