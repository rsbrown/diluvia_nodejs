var Defs = require("defs");

var WallTile = module.exports = function(options) {
    options             = options        || {};
    this._image         = options.image  || "empty.png:0,0";
};

WallTile.prototype = {
    moveInto: function(actor) {
        return false;
    },
    
    getImage:       function() { return this._image; },
    getLabel:       function() { return ""; },
    getTitle:       function() { return ""; },
    getDescription: function() { return ""; }
};
