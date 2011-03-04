var gamejs = require('gamejs');

var Canvas = function(controller, gamejs) {
    var self            = this;
    this._element       = document.getElementById(Diluvia.CANVAS_ID);
    this._viewport      = $(this._element.parentNode);
    this._context       = this._element.getContext("2d");
    this._controller    = controller;
    this._preload       = [];
    this._imageCache    = {};
    this._gamejs        = gamejs;
    this._lastDims      = [ 0, 0 ];
    this._lastMusic     = null;
};

Canvas.prototype = {
    paint: function(zoneData, zoneState) {
        this.resizeViewport();
        
        var zoneDims    = zoneData.dimensions,
            playerIdx   = zoneState.playerIdx,
            layerCount  = zoneDims[2],
            tileWidth   = Diluvia.TILE_DIMS[0],
            tileHeight  = Diluvia.TILE_DIMS[1],
            bgImg;

        if (zoneData.background) {
            bgImg = this._controller.getImage(zoneData.background);
            // bgImg = this.getSprite(zoneData.background);
            // this._gamejs.display.getSurface().blit( bgImg, 0, 0 );
        }
        
        if (zoneData.music != this._lastMusic) {
            this._controller.changeMusic(zoneData.music);
            this._lastMusic = zoneData.music;
        }
            
        // if (zoneDims[0] != this._lastDims[0] || zoneDims[1] != this._lastDims[1]) {
        //     this._element.width = this._element.width;            
        //     this._element.setAttribute("width",     zoneDims[0] * tileWidth);
        //     this._element.setAttribute("height",    zoneDims[1] * tileHeight);
        // }
        
        this._lastDims = zoneDims;
        this._tiles = [];
        var layerIndexes = [];
        
        for (var li = 0; li < layerCount; li++) {
            var layer = zoneState.layers[li];
            
            for (var key in layer) {
                layerIndexes.push(key);
            }
        }
                
        for (var i = 0, len = layerIndexes.length; i < len; i++) {
            var key             = layerIndexes[i],
                col             = Math.floor(key / zoneDims[0]),
                row             = key % zoneDims[0],
                destPixelCoords = Diluvia.rowColToPixels(row, col);
            
            if (bgImg) {
                // var tileRect = new gamejs.Rect([destPixelCoords[0],destPixelCoords[1]], [64, 64])
                // this._gamejs.display.getSurface().blit(
                //     img,
                //     [destPixelCoords[0],destPixelCoords[1]],
                //     tileRect
                // );
                
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
                    var tileSet = layer[key];
                
                    if (tileSet) {
                        for (var tsi = 0, tslen = tileSet.length; tsi < tslen; tsi++) {
                            var tileData    = tileSet[tsi],
                                tileId      = tileData[0],
                                tile        = zoneData.tiles[tileId];
                    
                            if (tile) {
                                // this._gamejs.draw.circle(
                                //     this._gamejs.display.getSurface(), 
                                //     'rgba(200, 200, 200, 0.4)', 
                                //     [destPixelCoords[0],destPixelCoords[1]],
                                // 32);
                                
                                // var img = this.getSprite(tile.imagePath);
                                // var tileRect = new gamejs.Rect([tile.coords[0],tile.coords[1]], [64, 64])
                                // this._gamejs.display.getSurface().blit(
                                //     img,
                                //     [destPixelCoords[0],destPixelCoords[1]],
                                //     tileRect
                                // );
                                
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
                            }
                            else {
                                console.log("COULD NOT DRAW " + tileId);
                            }
                        }
                    }
                }
            }
        }
        
        var vpCX        = this._viewport.width() / 2,
        vpCY            = this._viewport.height() / 2,
        actorCanvasX    = ((playerIdx % zoneDims[0]) * tileWidth) + (tileWidth / 2),
        actorCanvasY    = (Math.floor(playerIdx / zoneDims[0]) * tileHeight) + (tileHeight / 2),
        canvasLeft      = vpCX - actorCanvasX,
        canvasTop       = vpCY - actorCanvasY;

        $(this._element).css({
            "left": canvasLeft + "px",
            "top":  canvasTop  + "px"
        });
    },
    
    highlightTile: function(locX, locY) {
        mouseY = locY - this.getHeaderOffset();
        this._gamejs.draw.circle(this._gamejs.display.getSurface(), 'rgba(200, 200, 200, 0.4)', [locX, mouseY], 32);
    },
    
    resizeViewport: function() {
        var h = $("#viewport_container").outerHeight(),
            w = $("#viewport_container").outerWidth();
        return this._gamejs.display.setMode([w, h]);
    },
    
    getHeaderOffset: function() {
        return $('header').outerHeight() + $('#editor_dashboard').outerHeight();
    },
    
    getSprite: function(path) {
        if (this._imageCache[path] === undefined) {
            this._imageCache[path] = this._gamejs.image.load("/images/" + path);
        }
        return this._imageCache[path];
    },
    preloadImage: function(path) {
        // this._gamejs.preload(["./images/ship.png", "./images/sunflower.png"]);
        if (this._preload.indexOf("/images/" + path) == -1) {
            this._preload.push("/images/" + path);
            this._gamejs.image.preload(this._preload);
        }
    }
}