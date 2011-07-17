var Diluvia = {
    IMAGE_BASE_PATH:        "/images/",
    TILE_DIMS:              [64, 64],
    CANVAS_ID:              "viewport",
    INTERVAL_DELAY:         10,
    FLASH_DURATION:         250,
    
    BASE_EMPTY_TILE:        7,
    
    rowColToPixels: function(row, col) {
        return [row * Diluvia.TILE_DIMS[0], col * Diluvia.TILE_DIMS[1]];
    }
};

var DiluviaController = function(options) {
    var self                = this;
    
    this._mode                     = options.mode;
    this._protocol                 = new Protocol(this);
    this._connectCallback          = options.on_connect;
    this._keyboard                 = new Keyboard(this);
    this._pointer                  = new Pointer(this);
    this._canvas                   = new Canvas(this, document.getElementById(Diluvia.CANVAS_ID));
    this._sound                    = new Sound();
    this._preload                  = [];
    this._imageCache               = {};
    this._hasRecvData              = false;
    this._hasRecvState             = false;
    this._currentZoneState         = null;
    this._interval                 = setInterval(function() { self._onInterval(); }, Diluvia.INTERVAL_DELAY);
    this._stateQueue               = [];
    this._loadingInterval          = setInterval(function() { self._onLoadingInterval(); }, Diluvia.INTERVAL_DELAY);
                                   
    this._chatBoxElement           = $('<input id="chat_box">');
    this._chat                     = new Chat(document.body);
    this._serverInfo               = {};
    this._infoElement              = $('<div id="info_area"></div>');
    this._infoContainer            = $('<div id="info-bar"></div>');
    this._scoreElement             = $('<div id="score_number">0</div>');
    this._scoreBoard               = $('<div id="scoreboard"></div>');
    this._scoreTable               = $('<table cellspacing="0" cellpadding="0" border="0"></table>');
    this._selectedTileContainer    = $('<span id="selectedTile"></span>');
    this._selectedLayerContainer   = $('<span id="selectedLayer"></span>');
        
    this._editState = {
      hoverTileIdx:   0,
      selectedMode:   "paint",
      selectedLayer:  "BASE_LAYER",
      "BASE_LAYER":   Diluvia.BASE_EMPTY_TILE,
      "OBJECT_LAYER": Diluvia.BASE_EMPTY_TILE,
      "ACTOR_LAYER":  Diluvia.BASE_EMPTY_TILE
    };
    
    this["appendElementsFor_" + this._mode]();
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
    
    appendElementsFor_game: function() {
      this._infoContainer.html("Score: ");
      this._infoContainer.append(this._scoreElement);
      this._scoreBoard.append(this._scoreTable);    
      this._scoreTable.append("<thead><th>User</th><th>Score</th><tbody></tbody>");
      $(document.body).append(this._chatBoxElement);
      $(document.body).append(this._infoContainer);
      $(document.body).append(this._scoreBoard);
      this._scoreBoard.hide();
      $(document.getElementById(Diluvia.CANVAS_ID).parentNode).append(this._infoElement);
      this._chatBoxElement.hide();
      $(document.body).css({ overflow: "hidden" });
    },
    
    appendElementsFor_editor: function() {
      this.preloadImage("tile_highlight.png");
      this.preloadImage("tile_target.png");
      $("#eraser_link img").addClass("selected");
      this._infoContainer.html("Painting ");
      this._infoContainer.append(this._selectedTileContainer);
      this._infoContainer.append(" on ");
      this._infoContainer.append(this._selectedLayerContainer);
      $(document.body).append(this._infoContainer);
      this._selectedTileContainer.html("BASE_EMPTY_TILE");
      this._selectedLayerContainer.html(this._editState.selectedLayer);
    },
    
    getSelectedEditTile: function() {
      return this._editState[this._editState.selectedLayer];
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
    
    isInitialized: function() {
      return (!this.isLoadingImages() && this._hasRecvData && this._hasRecvState);
    },
    
    _onInterval: function() {
        if (this.isInitialized() && this._stateQueue.length > 0) {
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
    
    selectEraser: function() {
      this._editState.selectedMode = "paint";
      this._editState[this._editState.selectedLayer] = Diluvia.BASE_EMPTY_TILE;
      this._selectedTileContainer.html("BASE_EMPTY_TILE");
    },
    
    switchZone: function(zoneId) {
      this._protocol.send({ "type": "SwitchZone", "zone_id": zoneId });
    },
    
    showTileChooser: function(callback) {
      var self = this;
      $("#chooser").dialog({
          modal: true,
          closeOnEscape: true,
          width: 610,
          height: 600
      });
      this.loadTileChooser($("#chooser"), function(newTileId, newTileName, newTileInfo) {
        self._editState.selectedMode = "paint";
        self._editState[self._editState.selectedLayer] = newTileId;
        self._selectedTileContainer.html(newTileName);
        $("#chooser").dialog("close");
      });
    },
    
    loadTileChooser: function(element, callback) {
      var self = this;
      element.load('/editor/tiles', function(){
        $(".tile_image").hover(
          function(){ $("#ui-dialog-title-chooser").html($(this).attr("data-tileName")); },
          function(){ $("#ui-dialog-title-chooser").html("&nbsp;"); }
        );
        $(".tile_image").click(function(ev){
          ev.preventDefault();
          var newTileName = $(this).attr("data-tileName");
          var newTileId = $(this).attr("data-tileId");
          var newTileInfo = $(this).attr("data-tileInfo");
          callback(newTileId, newTileName, newTileInfo);
        });
      });
    },
    
    showZoneEditor: function() {
      $("#chooser").load('/editor/zone').dialog({
          modal: true,
          closeOnEscape: true,
          width: 300,
          height: 300
      });
    },

    showLayerChooser: function() {
      var self = this;
      $("#chooser").load('/editor/layers',function(){
        $("#" + self._editState.selectedLayer).addClass("selected");
        $("#layer_chooser p a").click(function(){
           self._editState.selectedMode = "paint";
           self._editState.selectedLayer = $(this).attr("id");
           self._selectedLayerContainer.html(self._editState.selectedLayer);
           self._selectedTileContainer.html(self._editState[self._editState.selectedLayer]);
           $("#chooser").dialog("close");
         });
      }).dialog({
          modal: true,
          closeOnEscape: true,
          width: 300,
          height: 300
      });
    },
    
    startPortalEditing: function() {
      this._editState.selectedMode = "portal";
      this._selectedTileContainer.html("portals");
      this._editState.selectedLayer = "OBJECT_LAYER";
      this._selectedLayerContainer.html(this._editState.selectedLayer);
    },
    
    bindPortalTileChooser: function() {
      var self = this;
      $("#portal_tile_chooser").click(function(ev) {
        ev.preventDefault();
        $("#portal_form").hide();
        $("#portal_form_tiles").show();
        self.loadTileChooser($("#portal_form_tiles"), function(tileId, tileName, tileInfo) {
          $("#portal_image_info").val(tileInfo);
          $("#portal_form_tiles").hide();
          $("#portal_form").show();
          var imgInfo = tileInfo.split(":");
          var imgCoords = imgInfo[1].split(",");
          var bgX = imgCoords[0]*64;
          var bgY = imgCoords[1]*64;
          $("#portal_tile_preview").css("background-image", "url(/images/" + imgInfo[0] + ")");
          $("#portal_tile_preview").css("background-position", "-" + bgX + "px -" + bgY + "px");
        });
      });
    },

    showPortalEditor: function(tileIdx) {
      var self = this;
      $("#chooser").load('/editor/portal/' + tileIdx, function(){
        self.bindPortalTileChooser();
      }).dialog({
          modal: true,
          closeOnEscape: true,
          width: 610,
          height: 600
      });
    },
    
    hoverTile: function(x, y) {
      if (this.isInitialized()) {
        var tileIdx = this.pixelsToIndex(x, y);
        var rowCol = this.indexToRowCol(tileIdx);
        $("#menu-info").html(rowCol[1] + "," + rowCol[0]);
        if (tileIdx != this._editState.hoverTileIdx) {
          this._canvas.drawTargetTile(this._protocol.getZoneData(), tileIdx);
          this._editState.hoverTileIdx = tileIdx;
        }
      }
    },

    editTile: function(x, y) {
      var tileIdx = this.pixelsToIndex(x, y);
      if (this._editState.selectedMode === "paint") {
        this._canvas.clearTarget();
        this._protocol.send({ "type": "EditTile", "tile_idx": tileIdx, "layer": this._editState.selectedLayer, "new_tile": this.getSelectedEditTile() });
      }
      else if (this._editState.selectedMode === "portal") {
        this.showPortalEditor(tileIdx);
      }
    },
    
    moveEditorView: function(dir) {
      var nextTileIndex  = this.indexForDirectionalMove(this._currentZoneState.viewCenterIdx, dir);
      if (nextTileIndex != -1) {
        this._currentZoneState.viewCenterIdx = nextTileIndex;
        this._canvas.recenter(this._protocol.getZoneData(), this._currentZoneState);
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
