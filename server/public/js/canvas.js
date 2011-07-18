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
};

Canvas.prototype = {
    paint: function(zoneData, zoneState) {
        var zoneDims        = zoneData.dimensions,
            viewCenterIdx   = zoneState.viewCenterIdx,
            layerCount      = zoneDims[2],
            bgImg;

        // Clear the old canvas wiht a filled black rectangle
        if (this._controller.getMode() === "editor") {
          this._context.fillStyle = "rgba(  0,   0,  0, 1.0)";
          this._context.fillRect(0, 0, this._canvasWidth, this._canvasHeight);
        }
        
        // Set the new Canvas width/height (zoom level may have changed)
        this._canvasWidth  = zoneDims[0] * this._tileWidth;
        this._canvasHeight = zoneDims[1] * this._tileHeight;
                
        if (zoneData.background) {
            bgImg = this._controller.getImage(Diluvia.BG_REL_PATH + zoneData.background);
        }
        
        // Update music file if music has changed (TODO: get this out of canvas.js)
        if (zoneData.music != this._lastMusic) {
            this._controller.changeMusic(zoneData.music);
            this._lastMusic = zoneData.music;
        }
        
        // Update HTML element width/height if they changed)
        if (zoneDims[0] != this._lastDims[0] || zoneDims[1] != this._lastDims[1]) {
            this._element.setAttribute("width",  this._canvasWidth);
            this._element.setAttribute("height", this._canvasHeight);
        }
        
        this._lastDims = zoneDims;
        
        var layerIndexes = [];
        
        for (var li = 0; li < layerCount; li++) {
            var layer = zoneState.layers[li];
            
            for (var layerKey in layer) {
                layerIndexes.push(layerKey);
            }
        }
                
        for (var i = 0, len = layerIndexes.length; i < len; i++) {
            var layerKey        = layerIndexes[i],
                col             = Math.floor(layerKey / zoneDims[0]),
                row             = layerKey % zoneDims[0],
                destPixelCoords = this.rowColToPixels(row, col);
            if (bgImg && (bgImg.width >= (destPixelCoords[0] + this._tileWidth)) && (bgImg.height >= (destPixelCoords[1] + this._tileHeight)) ) {
                this._context.drawImage(
                    bgImg,
                    col * Diluvia.TILE_DIMS[0],
                    row * Diluvia.TILE_DIMS[1],
                    Diluvia.TILE_DIMS[0],
                    Diluvia.TILE_DIMS[1],
                    destPixelCoords[1],
                    destPixelCoords[0],
                    this._tileWidth,
                    this._tileHeight
                );
            }
                    
            for (var li = 0; li < layerCount; li++) {
                var layer = zoneState.layers[li];
            
                if (layer) {
                    var tileSet = layer[layerKey];
                    
                    if (tileSet) {
                        for (var tsi = 0, tslen = tileSet.length; tsi < tslen; tsi++) {
                            var tileData    = tileSet[tsi],
                                tileId      = tileData[0],
                                tile        = zoneData.tiles[tileId];

                            if (tile) {
                              this._context.drawImage(
                                  this._controller.getImage(tile.imagePath),
                                  tile.coords[0],
                                  tile.coords[1],
                                  Diluvia.TILE_DIMS[0],
                                  Diluvia.TILE_DIMS[1],
                                  destPixelCoords[0],
                                  destPixelCoords[1],
                                  this._tileWidth,
                                  this._tileHeight
                              );
                              if (this._controller.getMode() === "editor") {this.hookEditorTiles(tile, tileId, destPixelCoords);}
                            }
                            else {
                                console.log("COULD NOT DRAW " + JSON.stringify(tileId));
                            }
                        }
                    }
                }
            }
        }
        this.recenter(zoneData, zoneState);
    },
    
    clearTarget: function() {
      this._clippedTile = null;
    },
    
    drawTargetTile: function(zoneData, tileIndex) {
      var zoneDims        = zoneData.dimensions,
          col             = Math.floor(tileIndex / zoneDims[0]),
          row             = tileIndex % zoneDims[0],
          destPixelCoords = this.rowColToPixels(row, col);
      
      if (this._clippedTile) {
        this._context.putImageData(this._clippedTile.image, this._clippedTile.x, this._clippedTile.y);
      }
      
      this._clippedTile = {
        
        image: this._context.getImageData(destPixelCoords[0], destPixelCoords[1], this._tileWidth, this._tileHeight),
        x:     destPixelCoords[0], 
        y:     destPixelCoords[1]
      }
  
      this._context.drawImage(
        this._controller.getImage("tile_target.png"),
        destPixelCoords[0],
        destPixelCoords[1],
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
          destPixelCoords[0], destPixelCoords[1],
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
        return [row * this._tileHeight, col * this._tileWidth];
    }
}