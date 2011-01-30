var Defs = require("defs");

var SpawnTile = module.exports = function(options) {
    options             = options        || {};
    this._image         = options.image  || "empty.png:0,0";
    
    this.spawnTile      = true;
};

SpawnTile.prototype = {
    canMoveInto: function(actor) {
        return true;
    },
    
    moveInto: function(actor) {
        
    },
    
    getImage:       function() { return this._image; },
    getLabel:       function() { return ""; },
    getTitle:       function() { return ""; },
    getDescription: function() { return ""; }
};
