var Diluvia = {
    IMAGE_BASE_PATH:        "images/",
    TILE_DIMS:              [64, 64],
    CANVAS_ID:              "viewport",
    INTERVAL_DELAY:         10,
    FLASH_DURATION:         250,
    
    rowColToPixels: function(row, col) {
        return [row * Diluvia.TILE_DIMS[0], col * Diluvia.TILE_DIMS[1]];
    }
};

var DiluviaController = function(server, options) {
    var self                = this;
    
    this._protocol          = new Protocol(this, server, options);
    this._keyboard          = new Keyboard(this);
    this._pointer           = new Pointer(this);
    this._canvas            = new Canvas(this, document.getElementById(Diluvia.CANVAS_ID));
    this._sound             = new Sound();
    this._preload           = [];
    this._imageCache        = {};
    this._hasRecvData       = false;
    this._hasRecvState      = false;
    this._currentZoneState  = null;
    this._interval          = setInterval(function() { self._onInterval(); }, Diluvia.INTERVAL_DELAY);
    this._stateQueue        = [];
    this._loadingInterval   = setInterval(function() { self._onLoadingInterval(); }, Diluvia.INTERVAL_DELAY);
    
    this._chatBoxElement    = $('<input id="chat_box">');
    this._chat              = new Chat(document.body);
    this._serverInfo        = {};
    this._infoElement       = $('<div id="info_area"></div>');
    
    $(document).ready(function() {
        $(document.body).append(self._chatBoxElement); 
        $(document.getElementById(Diluvia.CANVAS_ID).parentNode).append(self._infoElement);
        self._chatBoxElement.hide();
        $(document.body).css({ overflow: "hidden" });
    });
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
            this._currentZoneState = this._stateQueue.shift();
            this.repaintCanvas();
        }
    },
    
    _onLoadingInterval: function() {
      if (!this.isLoadingImages() && this._hasRecvState) {
          $("div#loading").hide();
          clearInterval(this._laodingInterval, this._currentZoneState);
      }
    },
    
    repaintCanvas: function() {
        this._canvas.paint(this._protocol.getZoneData(), this._currentZoneState);
    },
        
    commandStart: function(cmd) {
        this._protocol.send({ "type": "CommandStart", "command": cmd });
    },
    
    commandEnd: function(cmd) {
        this._protocol.send({ "type": "CommandEnd", "command": cmd });
    },
    
    command: function(cmd) {
        this._protocol.send({ "type": "Command", "command": cmd });
    },
    
    getChat: function() {
        return this._chat;
    },
    
    startMusic: function() {
        this._sound.startMusic(this._protocol.getZoneData().music);
    },
    
    stopMusic: function() {
        this._sound.stopMusic();
    },
    
    changeMusic: function(music) {
        this._sound.resetLoops(music);
    },
    
    showChatBox: function() {
        $(this._chatBoxElement).show();
        $(this._chatBoxElement).focus();
    },
    
    sendChatMessageInChatBox: function() {
        var jqBox = $(this._chatBoxElement);
        
        this._protocol.send({ "type": "Chat", "text": jqBox.val() });
        
        jqBox.val("");
        jqBox.hide();
    },
    
    displayChatMessage: function(text) {
        this._chat.addMessage(text);
        this._sound.playAudio("chat");
    },
    
    flash: function(color) {
        console.log("FLASHING " + color);
        
        var flashDiv = $("<div></div>");
        
        flashDiv.css({
            position:       "absolute",
            top:            "0px",
            left:           "0px",
            right:          "0px",
            bottom:         "0px",
            width:          "100%",
            height:         "100%",
            zIndex:         "254",
            background:     color
        });
        
        $(document.body).append(flashDiv);
        
        flashDiv.fadeOut(Diluvia.FLASH_DURATION, function() {
            flashDiv.remove();
        });
    },
    
    setServerInfo: function(serverInfo) { 
        this._serverInfo = serverInfo;
    
        if (serverInfo.revision) {
            this._infoElement.html("Diluvia Server Revision " + serverInfo.revision);
        }
    },
    getServerInfo: function(serverInfo) { return this._serverInfo; }
};
