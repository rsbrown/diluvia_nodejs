var Defs = require("defs");

var SpawnTile = module.exports = function() {
    this.spawnTile = true;
};

SpawnTile.prototype = {
    moveInto: function(actor) {
        return true;
    },
    
    getImage:       function() { return Defs.Images.spawnTile; },
    getLabel:       function() { return ""; },
    getTitle:       function() { return ""; },
    getDescription: function() { return ""; }
};
