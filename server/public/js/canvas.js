var Canvas = function(controller, element) {
    this._element       = element;
    this._container     = element.parentNode;
    
    this._element.setAttribute("width", $(this._container).innerWidth());
    this._element.setAttribute("height", $(this._container).innerHeight());
    
    this._context       = element.getContext("2d");
    this._controller    = controller;
};

Canvas.prototype = {
    paint: function(zoneData, zoneState) {        
        var zoneDims    = zoneState.dimensions,
            layerCount  = zoneDims[2];
            
        for (var li = 0; li < layerCount; li++) {
            var layer = zoneState.layers[li];
            
            for (var key in layer) {
                var layerTileIdx    = layer[key],
                    tile            = zoneData[layerTileIdx],
                    col             = Math.floor(key / zoneDims[0]),
                    row             = key % zoneDims[1],
                    destPixelCoords = Diluvia.rowColToPixels(row, col),
                    image           = this;

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
}