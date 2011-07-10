var Diluvia = {
    IMAGE_BASE_PATH:        "/images/",
    TILE_DIMS:              [64, 64],
    CANVAS_ID:              "viewport",
    INTERVAL_DELAY:         10,
    FLASH_DURATION:         250,
    
    rowColToPixels: function(row, col) {
        return [row * Diluvia.TILE_DIMS[0], col * Diluvia.TILE_DIMS[1]];
    }
};

var DiluviaController = function(options) {
    var self                = this;
    
    this._mode              = options.mode;
    this._protocol          = new Protocol(this, options.socket_host, options.socket_params);
    this._connectCallback   = options.on_connect;
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
    this._scoreElement      = $('<div id="score_number">0</div>');
    this._scoreContainer    = $('<div id="score">Score: </div>');
    this._scoreBoard        = $('<div id="scoreboard"></div>');
    this._scoreTable        = $('<table cellspacing="0" cellpadding="0" border="0"></table>');
    
    this._scoreContainer.append(this._scoreElement);
    this._scoreBoard.append(this._scoreTable);
    
    this._scoreTable.append("<thead><th>User</th><th>Score</th><tbody></tbody>");
    
    $(document).ready(function() {
        $(document.body).append(self._chatBoxElement); 
        $(document.body).append(self._scoreContainer);
        $(document.body).append(self._scoreBoard);
        
        self._scoreBoard.hide();
        
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
    
    getMode: function() {
      return this._mode;
    },
    
    getImage: function(path) {
        return this._imageCache[path];
    },
    
    getSound: function(){
        return this._sound;
    },
    
    updateZoneData: function(zoneData) {
        this._hasRecvData = true;
    },
    
    updateZoneState: function(zoneState) {
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
          clearInterval(this._loadingInterval, this._currentZoneState);
      }
    },
    
    repaintCanvas: function() {
        this._canvas.paint(this._protocol.getZoneData(), this._currentZoneState);
    },

    initWorldView: function() {
        this._protocol.send({ type: "InitWorldView" });
    },
    
    startPlaying: function() {
        this._protocol.send({ type: "StartGame" });
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
    
    editTile: function(x, y) {
      var tileIdx = this.pixelsToIndex(x, y);
      this._protocol.send({ "type": "EditTile", "tile_idx": tileIdx, "layer": "BASE_LAYER", "new_tile": "BASE_WATER" });
    },
    
    moveEditorView: function(dir) {
      var nextTileIndex  = this.indexForDirectionalMove(this._currentZoneState.viewCenterIdx, dir);
      if (nextTileIndex != -1) {
        this._currentZoneState.viewCenterIdx = nextTileIndex;
        this._canvas.recenter(this._protocol.getZoneData(), this._currentZoneState);
        // this.repaintCanvas();
      }
    },
    
    settleEditorView: function(dir) {
      this._protocol.send({ "type": "CenterEditorView", "index": this._currentZoneState.viewCenterIdx });
    },
    
    indexToRowCol: function(idx) {
      var dims = this._protocol.getZoneData().dimensions;
      var row = Math.floor(idx / dims[0]),
          col = idx % dims[0];
              
      return [row, col];
    },
    
    rowColToIndex: function(row, col) {
      var dims = this._protocol.getZoneData().dimensions;
      if (!(col < 0 || row < 0 || col >= dims[0] || row >= dims[1])) {
          return (row * dims[0]) + col;
      }
      else {
          return -1;
      }
    },
    
    pixelsToIndex: function(x, y) {
      var col = Math.floor((x-this._canvas._canvasLeft)/Diluvia.TILE_DIMS[0]);
      var row = Math.floor((y-this._canvas._canvasTop-$("#editor_dashboard").height()-$('header').height())/Diluvia.TILE_DIMS[1]);
      return this.rowColToIndex(row, col);
    },
    
    indexForDirectionalMove: function(idx, direction) {
        var rowCol = this.indexToRowCol(idx);
        if (direction == "n") {
            rowCol[0] -= 1;
        }
        else if (direction == "s") {
            rowCol[0] += 1;
        }
        else if (direction == "e") {
            rowCol[1] += 1;
        }
        else if (direction == "w") {
            rowCol[1] -= 1;
        }
        
        return this.rowColToIndex(rowCol[0], rowCol[1]);
    },
    
    getChat: function() {
        return this._chat;
    },
    
    startMusic: function() {
        this._sound.startMusic(this._protocol.getZoneData().music);
        this._protocol.send({ "type": "Command", "command": "StartMusic" });
    },
    
    stopMusic: function() {
        this._sound.stopMusic();
        this._protocol.send({ "type": "Command", "command": "StopMusic" });
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
    
    displayChatMessage: function(msgData) {
        this._chat.addMessage(msgData);
        this._sound.playAudio("chat");
    },
    
    flash: function(color) {
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
    
    completeHandshake: function(serverInfo) { 
        this._serverInfo = serverInfo;
    
        if (serverInfo.revision) {
            this._infoElement.html("Diluvia Server Revision " + serverInfo.revision);
        }
        this._connectCallback.call(this);
    },
    
    getServerInfo: function(serverInfo) { return this._serverInfo; },
    
    setScore: function(score) {
        this._scoreElement.html(score);
    },
    
    updateScoreboard: function(scoreData) {
        var el = this._scoreBoard.find("tbody");
        
        el.html("");
        
        for (var key in scoreData) {
            var score = scoreData[key];
            
            el.append(
                "<tr>" +
                    "<td>" + key    + "</td>" +
                    "<td>" + score  + "</td>" + 
                "</tr>"
            );
        }
        
        this.showScoreboard();
    },
    
    showScoreboard: function() {
        this._scoreBoard.show();
    },
    
    hideScoreboard: function() {
        this._scoreBoard.hide();
    }
};
