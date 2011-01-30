var Defs = require("defs");

var PortalTile = module.exports = function(options) {
    options             = options        || {};
    this._image         = options.image  || "empty.png:0,0";
    this._destZone      = options.zone   || 0; 
};

PortalTile.prototype = {
    moveInto: function(actor) {
        actor.teleport(this._destZone);
    },
    
    getImage:       function() { return this._image; },
    getLabel:       function() { return ""; },
    getTitle:       function() { return ""; },
    getDescription: function() { return ""; }
};
