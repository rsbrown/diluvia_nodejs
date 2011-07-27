var Diluvia = {
    MUSIC_BASE_PATH:        "/media/music/",
    IMAGE_BASE_PATH:        "/images/",
    BG_REL_PATH:            "backgrounds/",
    HL_REL_PATH:            "highlights/",
    TILE_DIMS:              [64, 64],
    CANVAS_ID:              "viewport",
    INTERVAL_DELAY:         10,
    FLASH_DURATION:         250,
    
    LAYERS:                 { BASE: 0, OBJECT: 1, ACTOR: 2 },
    
    REL_DECODE: function(arr)
    {
      var result = new Array;
      if(arr.length == 0) return result;
      for(var i = 0; i < arr.length; i+=2)
      {
        var val = arr[i];
        var count = arr[i+1];
        for(var c = 0; c < count; c++)
          result[result.length] = val;
      }
      return result;
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
    this._hasRecvarr              = false;
    this._hasRecvState             = false;
    this._currentZoneState         = null;
    this._interval                 = setInterval(function() { self._onInterval(); }, Diluvia.INTERVAL_DELAY);
    this._stateQueue               = [];
    this._loadingInterval          = setInterval(function() { self._onLoadingInterval(); }, Diluvia.INTERVAL_DELAY);
                                   
    this._chat                     = new Chat(document.body);
    this._serverInfo               = {};
        
    this._editState = {
      hoverTileIdx:   0,
      selectedMode:   "paint",
      selectedLayer:  Diluvia.LAYERS.OBJECT,
      0:              [9,  "Grass", "sprites.png:2,7"],
      1:              [6,  "Rock", "sprites.png:3,4"],
      2:              [0,  "Dude",  "dude.png:0,0"],
      zoneData: {}
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
      $(document.body).css({ overflow: "hidden" });
    },
    
    appendElementsFor_editor: function() {
      this.preloadImage(Diluvia.HL_REL_PATH + "highlight_portal.png");
      this.preloadImage(Diluvia.HL_REL_PATH + "highlight_spawn.png");
      this.preloadImage(Diluvia.HL_REL_PATH + "highlight_wall.png");
      this.preloadImage("tile_target.png");
      $("#object_edit_link img").addClass("selected");
      this.selectEditLayer(Diluvia.LAYERS.OBJECT);

      // async bindings
      var self = this;
      $("#save-button").click(function(ev){
        ev.preventDefault();
        self.saveZoneEdits();
      });
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
    
    initZoneData: function(msg) {
      this.initZoneTiles(msg.ZoneTiles);
      this.initZoneState(msg.ZoneLayout);
    },
    
    initZoneTiles: function(zoneData) {
        var tileData = zoneData.tiles;

        this._protocol.setZoneData(zoneData);
      
        if (zoneData.background) {
            this.preloadImage(Diluvia.BG_REL_PATH + zoneData.background);
        }
      
        for (var key in tileData) {
            var item        = tileData[key],
                imgParts    = item.image.split(':'),
                rowcol      = imgParts[1].split(',');
                              
            item.imagePath  = imgParts[0];
            item.coords     = [parseInt(rowcol[0])*Diluvia.TILE_DIMS[0], 
                               parseInt(rowcol[1])*Diluvia.TILE_DIMS[1]];
          
            this.preloadImage(item.imagePath);
        }
        this._hasRecvData = true;
    },

    initZoneState: function(zoneState) {
        this._hasRecvState = true;
        for (l in zoneState.layers) {
          zoneState.layers[l] = Diluvia.REL_DECODE(zoneState.layers[l]);
        }
        if (this.isEditMode()) {
          var zoneId = this._protocol.getZoneData().id;
          if (this._editState.zoneData[zoneId]) {
            if (this._editState.zoneData[zoneId].unsaved) {
              this.enableSaveButton();
            } else { 
              this.disableSaveButton();
            }
            zoneState = this._editState.zoneData[zoneId].data;
          } else {
            this._editState.zoneData[zoneId] = {unsaved: false, data: zoneState};
            this.disableSaveButton();
          }
        }
        this._stateQueue.push(zoneState);
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
      if (this.isEditMode()) {this._canvas.forgetHoverTile()};
      if (this._currentZoneState){
        this._canvas.paint(this._protocol.getZoneData(), this._currentZoneState);
      }
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
    
    /***********************
    *
    * EDITOR FUNCTIONS
    *
    ************************/
    isEditMode: function() {
      return (this._mode == "editor");
    },
    
    saveZoneEdits: function() {
      var zoneId = this._protocol.getZoneData().id;
      if (this._editState.zoneData[zoneId].unsaved) {
        var unsavedData = this._editState.zoneData[zoneId].data;
        delete this._editState.zoneData[zoneId];
        this._protocol.send({ type: "SaveZone", zoneId: zoneId, zoneData: unsavedData });
      }
    },
    
    selectEditor: function(editorName) {
      $("#editor_dashboard").find("img.selected").removeClass("selected")
      $("#"+editorName+"_edit_link").find("img").addClass("selected");
    },
    
    selectTileEditor: function() {
      this.selectEditor("tile");
      this.selectEditLayer(Diluvia.LAYERS.BASE);
    },
    
    selectObjectEditor: function() {
      this.selectEditor("object");
      this.selectEditLayer(Diluvia.LAYERS.OBJECT);
    },
    
    disableSaveButton: function() {
      this._editState.zoneData[this._protocol.getZoneData().id].unsaved = false;
      $("#save-button").html('saved');
      $("#save-button").addClass('disabled');
    },

    enableSaveButton: function() {
      this._editState.zoneData[this._protocol.getZoneData().id].unsaved = true;
      $("#save-button").html('save changes');
      $("#save-button").removeClass('disabled');
    },
    
    selectEditLayer: function(layerId) {
      this._editState.selectedMode = "paint";
      this._editState.selectedLayer = layerId;
      this.displayPreviewTile();
      this.repaintCanvas();
    },
    
    displayPreviewTile: function() {
      var tileInfo = this._editState[this._editState.selectedLayer][2];
      var imgInfo = tileInfo.split(":");
      var imgCoords = imgInfo[1].split(",");
      var bgX = imgCoords[0]*64;
      var bgY = imgCoords[1]*64;
      $("#edit_tile_preview").css("background-image", "url(/images/" + imgInfo[0] + ")");
      $("#edit_tile_preview").css("background-position", "-" + bgX + "px -" + bgY + "px");
    },
    
    getSelectedEditLayer: function() {
      return this._editState.selectedLayer;
    },
       
    getSelectedEditTile: function() {
      return this._editState[this._editState.selectedLayer][0];
    },
    
    selectEraser: function() {
      this._editState.selectedMode = "erase";
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
        self._editState[self._editState.selectedLayer] = [newTileId, newTileName, newTileInfo];
        self.displayPreviewTile();
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

    startPortalEditing: function() {
      this.selectEditLayer(Diluvia.LAYERS.OBJECT);
      this._editState.selectedMode = "portal";
    },
    
    bindPortalEditActions: function(tileIdx) {
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
      $('#portal-form').ajaxForm(function(res) {
        var zoneState = self._editState.zoneData[self._protocol.getZoneData().id].data;
        var layer = zoneState.layers[self._editState.selectedLayer];
        layer[tileIdx] = [res.portalId];
        self.enableSaveButton();
        self.saveZoneEdits();
        $("#chooser").dialog("close");
      });
    },

    showPortalEditor: function(tileIdx) {
      var self = this;
      $("#chooser").load('/editor/portal/' + tileIdx, function(){
        self.bindPortalEditActions(tileIdx);
      }).dialog({
          modal: true,
          closeOnEscape: true,
          width: 610,
          height: 300
      });
    },
    
    zoomOutEditor: function(){
      this._canvas.zoomOut();
      this.repaintCanvas();
    },
    
    zoomInEditor: function(){
      this._canvas.zoomIn();
      this.repaintCanvas();
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
        var zoneState = this._editState.zoneData[this._protocol.getZoneData().id].data;
        var layer = zoneState.layers[this._editState.selectedLayer];
        layer[tileIdx] = [this.getSelectedEditTile()];
        this._currentZoneState = zoneState;
        this.enableSaveButton();
        this.repaintCanvas();
      }
      else if (this._editState.selectedMode === "erase") {
        var zoneState = this._editState.zoneData[this._protocol.getZoneData().id].data;
        var layer = zoneState.layers[this._editState.selectedLayer];
        layer[tileIdx] = null;
        this._currentZoneState = zoneState;
        this.enableSaveButton();
        this.repaintCanvas();
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
      var col = Math.floor((x-this._canvas._canvasLeft)/this._canvas.getTileWidth());
      var row = Math.floor((y-this._canvas._canvasTop-$('header').height())/this._canvas.getTileHeight());
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
            $("#info_area").html("Diluvia Server Revision " + serverInfo.revision);
        }
        this._connectCallback.call(this);
    },
    
    getServerInfo: function(serverInfo) { return this._serverInfo; },
    
    setScore: function(score) {
        $("#score_number").html(score);
    },
    
    updateScoreboard: function(scoreData) {
        var el = $("#scoreboard").find("tbody");
        
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
        $("#scoreboard").show();
    },
    
    hideScoreboard: function() {
        $("#scoreboard").hide();
    }
};
