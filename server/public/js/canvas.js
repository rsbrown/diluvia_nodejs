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
};

Canvas.prototype = {
    paint: function(zoneData, zoneState) {        
        var zoneDims        = zoneData.dimensions,
            viewCenterIdx   = zoneState.viewCenterIdx,
            layerCount      = zoneDims[2],
            tileWidth       = Diluvia.TILE_DIMS[0],
            tileHeight      = Diluvia.TILE_DIMS[1],
            bgImg;
                    
        if (zoneData.background) {
            bgImg = this._controller.getImage(zoneData.background);
        }
        
        if (zoneData.music != this._lastMusic) {
            this._controller.changeMusic(zoneData.music);
            this._lastMusic = zoneData.music;
        }
            
        if (zoneDims[0] != this._lastDims[0] || zoneDims[1] != this._lastDims[1]) {
            this._element.width = this._element.width;            
            this._element.setAttribute("width",     zoneDims[0] * tileWidth);
            this._element.setAttribute("height",    zoneDims[1] * tileHeight);
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
                destPixelCoords = Diluvia.rowColToPixels(row, col);
            
            if (bgImg) {
                this._context.drawImage(
                    bgImg,
                    destPixelCoords[0],
                    destPixelCoords[1],
                    Diluvia.TILE_DIMS[0],
                    Diluvia.TILE_DIMS[1],
                    destPixelCoords[0],
                    destPixelCoords[1],
                    Diluvia.TILE_DIMS[0],
                    Diluvia.TILE_DIMS[1]
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
                                    Diluvia.TILE_DIMS[0],
                                    Diluvia.TILE_DIMS[1]
                                );
                                if (this._controller.getMode() === "editor") {this.hookEditorTiles(tile, tileId, destPixelCoords);}
                            }
                            else {
                                console.log("COULD NOT DRAW " + tileId);
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
          destPixelCoords = Diluvia.rowColToPixels(row, col);
      
      if (this._clippedTile) {
        this._context.putImageData(this._clippedTile.image, this._clippedTile.x, this._clippedTile.y);
      }
      
      this._clippedTile = {
        image: this._context.getImageData(destPixelCoords[0], destPixelCoords[1], Diluvia.TILE_DIMS[0], Diluvia.TILE_DIMS[1]),
        x:     destPixelCoords[0], 
        y:     destPixelCoords[1]
      }
  
      this._context.drawImage(
        this._controller.getImage("tile_target.png"),
        destPixelCoords[0],
        destPixelCoords[1],
        Diluvia.TILE_DIMS[0],
        Diluvia.TILE_DIMS[1]
      );
    },
    
    hookEditorTiles: function(tile, tileId, destPixelCoords) {
      if(tileId.indexOf("PortalTile") === 0) {
        this._context.drawImage(
          this._controller.getImage("tile_highlight.png"),
          destPixelCoords[0],
          destPixelCoords[1],
          Diluvia.TILE_DIMS[0],
          Diluvia.TILE_DIMS[1]
        );
      }
    },
    
    recenter: function(zoneData, zoneState) {
      var zoneDims              = zoneData.dimensions,
          viewCenterIdx         = zoneState.viewCenterIdx,
          tileWidth             = Diluvia.TILE_DIMS[0],
          tileHeight            = Diluvia.TILE_DIMS[1],
          vpCX                  = this._viewport.width() / 2,
          vpCY                  = this._viewport.height() / 2,
          actorCanvasX          = ((viewCenterIdx % zoneDims[0]) * tileWidth) + (tileWidth / 2),
          actorCanvasY          = (Math.floor(viewCenterIdx / zoneDims[0]) * tileHeight) + (tileHeight / 2);

      this._canvasLeft      = vpCX - actorCanvasX,
      this._canvasTop       = vpCY - actorCanvasY;
      

      $(this._element).css({
          "left": this._canvasLeft + "px",
          "top":  this._canvasTop  + "px"
      });
    },
    
    getCenterPixels: function() {
      return {"x": this._viewport.width() / 2, "y": this._viewport.height() / 2};
    }
}