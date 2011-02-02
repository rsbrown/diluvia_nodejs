var Defs        = require("defs"),
    _           = require("underscore");
    
var Tile = module.exports = function(options) {
    options             = options || {};
    
    this._image         = options.image         || "empty.png:0,0";
    this._label         = options.label         || null;
    this._title         = options.title         || "Tile";
    this._description   = options.description   || "Tile";
    this._fps           = options.fps           || undefined;
};

Tile.instanceFromDefinition = function(tileDef) {
    var klass = eval(tileDef.class); // TODO: some safety?
    return new klass(tileDef);
};

Tile.prototype = {
    moveInto: function(actor) {
    },
    
    moveOut: function(actor) {
    },
    
    canMoveInto: function(actor, tileIndex, tileData) {
        return true;
    },
    
    setZone: function(zone) {
        return this._zone;
    },
    
    getZone: function() {
        return this._zone;
    },
    
    onPlace: function(layer, tileIndex, placeData) {
        
    },
    
    getImage:       function() { return this._image },
    getLabel:       function() { return this._label },
    getTitle:       function() { return this._title },
    getDescription: function() { return this._description },
    getFPS:         function() { return this._fps },
    
    getRenderAttributes: function() {
        return {
            "image":    this.getImage(),
            "fps":      this.getFPS()
        }
    }
};

// need these for instancing tiles

var ActorTile   = require("actor_tile"),
    SpawnTile   = require("spawn_tile"),
    PortalTile  = require("portal_tile"),
    WallTile    = require("wall_tile"),
    PainTile    = require("pain_tile");

