var Defs = require("defs");

var SpawnTile = module.exports = function(options) {
    options             = options        || {};
    this._image         = options.image  || "empty.png:0,0";
    
    this.spawnTile      = true;
};

SpawnTile.prototype = {
    moveInto: function(actor) {
        return true;
    },
    
    getImage:       function() { return this._image; },
    getLabel:       function() { return ""; },
    getTitle:       function() { return ""; },
    getDescription: function() { return ""; }
};
