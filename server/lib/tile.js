var TILE_SIZE = [64, 64];

var Tile = module.exports = function(options) {
    options             = options || {};
    
    this._image         = options.image         || "empty.png:0,0";
    this._label         = options.label         || null;
    this._title         = options.title         || "Tile";
    this._description   = options.description   || "Tile";
};

Tile.prototype = {
    moveInto: function(actor) {
    },
    
    canMoveInto: function(actor) {
        return true;
    },
    
    getImage:       function() { return this._image },
    getLabel:       function() { return this._label },
    getTitle:       function() { return this._title },
    getDescription: function() { return this._description }
};
