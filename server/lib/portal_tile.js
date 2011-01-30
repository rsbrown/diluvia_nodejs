var Defs = require("defs");

var PortalTile = module.exports = function(options) {
    options             = options        || {};

    this._image         = options.image  || "sprites.png:2,8";
    this._destZone      = options.zone   || 0;
    this._destCoords    = options.dropAt;
};

PortalTile.prototype = {
    canMoveInto: function(actor) {
        return "silent";
    },
    
    moveInto: function(actor) {
        console.log("TELEPORT!!!!!!");
        actor.teleport(this._destZone, this._destCoords);
    },
    
    getImage:       function() { return this._image; },
    getLabel:       function() { return ""; },
    getTitle:       function() { return ""; },
    getDescription: function() { return ""; }
};
