var Defs = require("defs");

var SpawnTile = module.exports = function() {
    this.spawnTile = true;
};

ActorTile.prototype = {
    movesInto: function(actor) {
        return false;
    },
    
    getImage:       function() { return Defs.Images.spawnTile; },
    getLabel:       function() { return ""; },
    getTitle:       function() { return ""; },
    getDescription: function() { return ""; }
};
