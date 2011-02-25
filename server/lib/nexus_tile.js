var Defs    = require("defs"),
    Tile    = require("tile"),
    _       = require("underscore");

var NexusTile = module.exports = function(options) {
    Tile.apply(this, arguments);
};

_.extend(NexusTile.prototype, Tile.prototype, {
    moveInto: function(actor) {
    },
    moveOut: function(actor) {
    },
});
