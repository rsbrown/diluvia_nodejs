var Defs        = require("defs"),
    _           = require("underscore");
    
var Tile = module.exports = function(options) {
    options             = options || {};
    
    this._image         = options.image         || "";
    this._label         = options.label         || null;
    this._type          = options.type          || "Tile";
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

    bumpInto: function(actor) {
        actor.moveFailed();
    },
    
    canMoveInto: function(actor, tileIndex, tileData, layerIndex) {
        return true;
    },
    
    setZone: function(zone) {
        this._zone = zone;
    },
    
    getZone: function() {
        return this._zone;
    },
    
    onPlace: function(layer, tileIndex, tileData) {

    },
    
    getImage:       function() { return this._image },
    getLabel:       function() { return this._label },
    getType:        function() { return this._type },
    getDescription: function() { return this._description },
    getFPS:         function() { return this._fps },
    
    setImage:       function(img) { this._image = img; },
    
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
    PainTile    = require("pain_tile"),
    GoalTile    = require("goal_tile");

