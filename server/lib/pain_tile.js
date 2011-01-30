var Defs = require("defs");

var PainTile = module.exports = function(options) {
    options             = options        || {};
    this._image         = options.image  || "empty.png:0,0";
};

PainTile.prototype = {
    moveInto: function(actor) {
        actor.takeDamage(25);
        return true;
    },
    
    getImage:       function() { return this._image; },
    getLabel:       function() { return ""; },
    getTitle:       function() { return ""; },
    getDescription: function() { return ""; }
};
