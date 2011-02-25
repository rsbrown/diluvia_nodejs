var DiluviaEditor = function(server, options) {
    var self                = this;
    this._canvas            = new Canvas(this, document.getElementById(Diluvia.CANVAS_ID));
    $(document).ready(function() {
        $(document.body).css({ overflow: "hidden" });
    });
};

DiluviaEditor.prototype = {
    preloadImage: function(path) {
        if (this._preload.indexOf(path) == -1 && !this._imageCache[path]) {
            var image   = new Image(),
                self    = this;
        
            image.src = Diluvia.IMAGE_BASE_PATH + path;
        
            this._preload.push(path);
            this._imageCache[path] = image;
            
            $(image).load(function(ev) {
                var idx = self._preload.indexOf(path);
                
                if (idx != -1) {
                    self._preload.splice(idx, 1);
                }
            });
        }
    },
    
    isLoadingImages: function() {
        return this._preload.length != 0;
    },
    
    getImage: function(path) {
        return this._imageCache[path];
    },
    
    updatedZoneData: function(zoneData) {
        this._hasRecvData = true;
    },
    
    updatedZoneState: function(zoneState) {
        this._hasRecvState = true;
        this._stateQueue.push(zoneState);
    },
    
    repaintCanvas: function() {
        this._canvas.paint(this._protocol.getZoneData(), this._currentZoneState);
    }
};
