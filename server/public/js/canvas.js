var Canvas = function(controller, element) {
    var self            = this;
    
    this._element       = element;
    this._viewport      = $(element.parentNode);
        
    this._context       = element.getContext("2d");
    this._controller    = controller;
    
    this._lastDims      = [ 0, 0 ];
    
    this._element.style.position = "absolute";
};

Canvas.prototype = {
    paint: function(zoneData, zoneState) {        
        var zoneDims    = zoneState.dimensions,
            playerIdx   = zoneState.playerIdx,
            layerCount  = zoneDims[2],
            tileWidth   = Diluvia.TILE_DIMS[0],
            tileHeight  = Diluvia.TILE_DIMS[1],
            bgImg;
                    
        if (zoneData.background) {
            bgImg = this._controller.getImage(zoneData.background);
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
            
            for (var key in layer) {
                if (layerIndexes.indexOf(key) == -1) {
                    layerIndexes.push(key);
                }
            }
        }
        
        for (var i = 0, len = layerIndexes.length; i < len; i++) {
            var key             = layerIndexes[i],
                col             = Math.floor(key / zoneDims[0]),
                row             = key % zoneDims[0],
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
                var layerTileIdx = zoneState.layers[li][key];
                
                if (layerTileIdx) {
                    var tile = zoneData.tiles[layerTileIdx];
                
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
            }
        }
        
        
        var vpCX            = this._viewport.width() / 2,
            vpCY            = this._viewport.height() / 2,
            actorCanvasX    = ((playerIdx % zoneDims[0]) * tileWidth) + (tileWidth / 2),
            actorCanvasY    = (Math.floor(playerIdx / zoneDims[0]) * tileHeight) + (tileHeight / 2),
            canvasLeft      = vpCX - actorCanvasX,
            canvasTop       = vpCY - actorCanvasY;

        $(this._element).css({
            "left": canvasLeft + "px",
            "top":  canvasTop  + "px"
        });
    }
}