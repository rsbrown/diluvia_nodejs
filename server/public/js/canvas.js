var Canvas = function(controller, element) {
    var self            = this;
    
    this._element       = element;
    this._viewport      = $(element.parentNode);
    this._context       = element.getContext("2d");
    this._controller    = controller;
    this._lastDims      = [ 0, 0 ];
    this._lastMusic     = null;
    this._canvasLeft    = -1;
    this._canvasTop     = -1;
    this._clippedTile   = null;
    this._element.style.position = "absolute";
    this._zoomLevels    = [0.25, 0.5, 0.75, 1.0, 1.25];
    this._zoom          = 3;
    this._tileWidth     = Diluvia.TILE_DIMS[0] * this._zoomLevels[this._zoom];
    this._tileHeight    = Diluvia.TILE_DIMS[1] * this._zoomLevels[this._zoom];
    this._canvasWidth;
    this._canvasHeight;
    this._backGround;
};

Canvas.prototype = {
    resizeCanvas: function(zoneDims) {
      if (zoneDims[0] != this._lastDims[0] || zoneDims[1] != this._lastDims[1]) {
          this._element.setAttribute("width",  this._canvasWidth);
          this._element.setAttribute("height", this._canvasHeight);
      }
      this._lastDims = zoneDims;
    },
    
    clearCanvas: function() {
      this._context.fillStyle = "rgba(  0,   0,  0, 1.0)";
      this._context.fillRect(0, 0, this._canvasWidth, this._canvasHeight);
    },
    
    paint: function() {
        var zoneData        = this._controller.getZoneData(),
            zoneState       = this._controller.getZoneState(),
            zoneDims        = zoneData.dimensions;
        
        // Set the new Canvas width/height (zoom level may have changed)
        this._canvasWidth  = zoneDims[0] * this._tileWidth;
        this._canvasHeight = zoneDims[1] * this._tileHeight;
                
        if (zoneData.background) {
          this._backGround = this._controller.getImage(Diluvia.BG_REL_PATH + zoneData.background);
        } else {
          this._backGround = null;
        }
        
        // Update music file if music has changed (TODO: get this out of canvas.js)
        if (zoneData.music != this._lastMusic) {
            this._controller.changeMusic(zoneData.music);
            this._lastMusic = zoneData.music;
        }
        
        this.resizeCanvas(zoneDims);

        // Clear the old canvas with a filled black rectangle.
        // This is necessary when erasing tiles in edit mode.
        if (this._controller.isEditMode()) {
          this.clearCanvas();
        }
        
        this.paintZoneUpdate(zoneData, zoneState, zoneDims[2]);
    },
    
    paintZoneUpdate: function(zoneData, zoneState, layerCount) {
        var zoneDims        = zoneData.dimensions,
            viewCenterIdx   = zoneState.viewCenterIdx,
            layerIndexes = [];
          
        for (var layerIdx = 0; layerIdx < layerCount; layerIdx++) {
            var layer = zoneState.layers[layerIdx];
        
            // Only draw the selected layer and below in edit mode.
            if (this._controller.isEditMode() && layerIdx >= this._controller.getSelectedEditLayer()) {break};

            for (var tileIdx in layer) {
              var row             = Math.floor(tileIdx / zoneDims[0]),
                  col             = tileIdx % zoneDims[0],
                  destPixelCoords = this.rowColToPixels(row, col);

              if (this._backGround && (layerIdx == 0) && (this._backGround.width >= (destPixelCoords.x + this._tileWidth)) && (this._backGround.height >= (destPixelCoords.y + this._tileHeight)) ) {
                  this._context.drawImage(
                      this._backGround,
                      col * Diluvia.TILE_DIMS[0],
                      row * Diluvia.TILE_DIMS[1],
                      Diluvia.TILE_DIMS[0],
                      Diluvia.TILE_DIMS[1],
                      destPixelCoords.x,
                      destPixelCoords.y,
                      this._tileWidth,
                      this._tileHeight
                  );
              }

              var tileSet = layer[tileIdx];
              
              if (tileSet) {
                  for (var tsi = 0; tsi < tileSet.length; tsi++) {
                      var tileId      = tileSet[tsi],
                          tile        = null;

                      if (typeof tileId === "object") {
                        tile = zoneData.tiles[tileId[0]];
                      } else {
                        tile = zoneData.tiles[tileId];
                      }
                      
                      if (tile) {
                        this._context.drawImage(
                            this._controller.getImage(tile.imagePath),
                            tile.coords[0],tile.coords[1],
                            Diluvia.TILE_DIMS[0],Diluvia.TILE_DIMS[1],
                            destPixelCoords.x,destPixelCoords.y,
                            this._tileWidth,this._tileHeight
                        );
                        if (this._controller.isEditMode()) {this.hookEditorTiles(tile, tileId, destPixelCoords);}
                      }
                      else if (tileId) {
                          console.log("COULD NOT DRAW " + JSON.stringify(tileId));
                      }
                  }
              }
            }
        }
        this.recenter(zoneData, zoneState);
    },
    
    playAnimation: function(animOptions) {
      var ACTOR_LAYER = 2; // TODO: introspect to find the actor layer index
      var ANIM_OBJ_INDEX = 0; // TODO: Handle multiple animation objects on same tile

      var zoneData        = this._controller.getZoneData(),
          zoneState       = this._controller.getZoneState(),
          zoneDims        = zoneData.dimensions,
          tileIndex       = animOptions.actorIdx,
          tileId          = zoneState.layers[ACTOR_LAYER][tileIndex][ANIM_OBJ_INDEX][0],
          tile            = zoneData.tiles[tileId],
          animDef         = tile.animations[animOptions.animType],
          frames          = tile.animations[animOptions.animType].frames,
          frameCount      = 0,
          row             = Math.floor(tileIndex / zoneDims[0]),
          col             = tileIndex % zoneDims[0],
          destPixelCoords = this.rowColToPixels(row, col),
          self            = this;
      
      // 1: Clip the current frame and save it
      // 2: Build an array of image data for the animation frames to be drawn
      // 3: Start a timer to draw the animation frames, with the original clipped frame as the final animation frame      
      
      self._controller.startAnimating();
      
      var animInterval = setInterval(function() {
        if (frameCount == frames.length) {
          clearInterval(animInterval);
          self._controller.finishAnimating();
          self.paint(); // Repaint the last known zone state
        } else {
          self.paintZoneUpdate(zoneData, zoneState, Diluvia.LAYERS.OBJECT); // Do not draw the actor layer
          self._context.drawImage(
              self._controller.getImage(animDef.imagePath),
              frames[frameCount][0],frames[frameCount][1],
              Diluvia.TILE_DIMS[0],Diluvia.TILE_DIMS[1],
              destPixelCoords.x,destPixelCoords.y,
              self._tileWidth,self._tileHeight
          );
          frameCount++;
        }
      }, Diluvia.ANIM_DELAY);
    },
    
    forgetHoverTile: function() {
      this._clippedTile = null;
    },
    
    drawTargetTile: function(zoneData, tileIndex) {
      var zoneDims        = zoneData.dimensions,
          row             = Math.floor(tileIndex / zoneDims[0]),
          col             = tileIndex % zoneDims[0],
          destPixelCoords = this.rowColToPixels(row, col);
      
      if (this._clippedTile) {
        this._context.putImageData(this._clippedTile.image, this._clippedTile.x, this._clippedTile.y);
      }
      
      this._clippedTile = {
        image: this._context.getImageData(destPixelCoords.x, destPixelCoords.y, this._tileWidth, this._tileHeight),
        x:     destPixelCoords.x,
        y:     destPixelCoords.y
      }
  
      this._context.drawImage(
        this._controller.getImage("tile_target.png"),
        destPixelCoords.x,
        destPixelCoords.y,
        this._tileWidth,
        this._tileHeight
      );
    },
    
    hookEditorTiles: function(tile, tileId, destPixelCoords) {
      var highlight_img = null;
      if(this.isPortalTile(tile, tileId)) {
        highlight_img = Diluvia.HL_REL_PATH + "highlight_portal.png";
      } else if (this.isSpawnTile(tile)) {
        highlight_img = Diluvia.HL_REL_PATH + "highlight_spawn.png";
      } else if (this.isNotPassable(tile)) {
        highlight_img = Diluvia.HL_REL_PATH + "highlight_wall.png";
      }
      
      if (highlight_img) {
        this._context.drawImage(
          this._controller.getImage(highlight_img), 
          destPixelCoords.x, destPixelCoords.y,
          this._tileWidth, this._tileHeight
        );
      }
    },
    
    isPortalTile: function(tile, tileId) {
      return (tile.label.toUpperCase().indexOf("PORTAL") !== -1);
    },
        
    isSpawnTile: function(tile) {
      return (tile.label.toUpperCase().indexOf("SPAWN") !== -1);
    },
    
    isNotPassable: function(tile) {
      return !tile.passable;
    },
        
    recenter: function(zoneData, zoneState) {
      var zoneDims              = zoneData.dimensions,
          viewCenterIdx         = zoneState.viewCenterIdx,
          vpCX                  = this._viewport.width() / 2,
          vpCY                  = this._viewport.height() / 2,
          actorCanvasX          = ((viewCenterIdx % zoneDims[0]) * this._tileWidth) + (this._tileWidth / 2),
          actorCanvasY          = (Math.floor(viewCenterIdx / zoneDims[0]) * this._tileHeight) + (this._tileHeight / 2);

      this._canvasLeft      = vpCX - actorCanvasX,
      this._canvasTop       = vpCY - actorCanvasY;
      
      $(this._element).css({
          "left": this._canvasLeft + "px",
          "top":  this._canvasTop  + "px"
      });
    },
    
    getCenterPixels: function() {
      return {"x": this._viewport.width() / 2, "y": this._viewport.height() / 2};
    },
    
    getTileWidth: function() {
      return this._tileWidth;
    },
    
    getTileHeight: function() {
      return this._tileHeight;
    },
    
    zoomIn: function() {
      if (this._zoom+1 < this._zoomLevels.length) {
        this._zoom++;
        this.setTileWidthHeight();
      }
    },
    
    zoomOut: function() {
      if (this._zoom > 0) {
        this._zoom--;
        this.setTileWidthHeight();
      }
    },
    
    setTileWidthHeight: function() {
      this._tileWidth     = Diluvia.TILE_DIMS[0] * this._zoomLevels[this._zoom];
      this._tileHeight    = Diluvia.TILE_DIMS[1] * this._zoomLevels[this._zoom];
      this._lastDims      = [ 0, 0 ];
    },
    
    rowColToPixels: function(row, col) {
      return {x: col * this._tileWidth, y: row * this._tileHeight};
    }
}