var Defs = require("defs");

var ActorTile = module.exports = function(account) {
    this.account = account;
};

ActorTile.prototype = {
    moveInto: function(actor) {
        return false;
    },
    
    getImage:       function() { return Defs.Images.actorTile; },
    getLabel:       function() { return ""; },
    getTitle:       function() { return ""; },
    getDescription: function() { return ""; }
};
