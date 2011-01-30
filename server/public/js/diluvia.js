var Diluvia = {
    IMAGE_BASE_PATH:        "images/",
    TILE_DIMS:              [64, 64],
    CANVAS_ID:              "viewport",
    INTERVAL_DELAY:         10,
    
    rowColToPixels: function(row, col) {
        return [row * Diluvia.TILE_DIMS[0], col * Diluvia.TILE_DIMS[1]];
    }
};

var DiluviaController = function(server, options) {
    var self            = this;
    
    this._protocol      = new Protocol(this, server, options);
    this._keyboard      = new Keyboard(this);
    this._canvas        = new Canvas(this, document.getElementById(Diluvia.CANVAS_ID));
    this._sound         = new Sound();
    this._preload       = [];
    this._imageCache    = {};
    this._hasRecvData   = false;
    this._hasRecvState  = false;
    this._interval      = setInterval(function() { self._onInterval(); }, Diluvia.INTERVAL_DELAY);
    this._stateQueue    = [];
    this._loadingInterval      = setInterval(function() { self._onLoadingInterval(); }, Diluvia.INTERVAL_DELAY);
};

DiluviaController.prototype = {
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
    
    getSound: function(){
        return this._sound;
    },
    
    updatedZoneData: function(zoneData) {
        this._hasRecvData = true;
    },
    
    updatedZoneState: function(zoneState) {
        this._hasRecvState = true;
        this._stateQueue.push(zoneState);
    },
    
    _onInterval: function() {
        if (!this.isLoadingImages() && this._hasRecvData && this._hasRecvState && this._stateQueue.length > 0) {
            this._canvas.paint(this._protocol.getZoneData(), this._stateQueue.shift());
        }
    },
    
    _onLoadingInterval: function() {
      if (!this.isLoadingImages() && this._hasRecvState) {
          $("div#loading").hide();
          clearInterval(this._laodingInterval);
      }
    },
    
    move: function(cmd) {
        this._protocol.send({ "type": "Move", "command": cmd });
    },
    
    commandStart: function(cmd) {
        this._protocol.send({ "type": "CommandStart", "command": cmd });
    },
    
    commandEnd: function(cmd) {
        this._protocol.send({ "type": "CommandEnd", "command": cmd });
    },
    
    command: function(cmd) {
        this._protocol.send({ "type": "Command", "command": cmd });
    }
};
