var Defs        = require("defs"),
    _           = require("underscore");
    
var Tile = module.exports = function(options) {
    options             = options || {};

    this._image         = options.image         || "";
    this._animations    = options.animations;
    this._label         = options.name          || "";
    this._type          = options.type          || "Tile";
    this._description   = options.description   || "Tile";
};

Tile.actor_tiles = null;

Tile.getActorTiles = function(tileId) {
  if (Tile.actor_tiles == null) {
    Tile.actor_tiles = {};
    for (tileId in Defs.ACTOR_TILES) {
      var tileDef = Defs.ACTOR_TILES[tileId];
      Tile.actor_tiles[tileId] = Tile.instanceFromDefinition(tileDef.class, tileDef);
    }
  }
  return Tile.actor_tiles;
},

Tile.instanceFromDefinition = function(class, options) {
    var klass = eval(class); // TODO: some safety?
    var tile = new klass(options);
    tile._class = class;
    return tile;
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
    
    isImpassable: function(){
      return false;
    },
    
    setZone: function(zone) {
      this._zone = zone;
    },
    
    getZone: function() {
      return this._zone;
    },
    
    getClass: function() {
      return this._class;
    },
    
    onPlace: function(layer, tileIndex, tileData) {

    },
    
    getImage:       function() { return this._image },
    getAnimations:  function() { return this._animations },
    getLabel:       function() { return this._label },
    getType:        function() { return this._type },
    getDescription: function() { return this._description },
    
    setImage:       function(img) { this._image = img; },
    
    getRenderAttributes: function() {
        return {
            "image"      :    this.getImage(),
            "animations" :    this.getAnimations(),
            "label"      :    this.getLabel(),
            "passable"   :    !this.isImpassable()
        }
    }
};

// need these for instancing tiles

var ActorTile         = require("actor_tile"),
    MobSpawnTile      = require("mob_spawn_tile"),
    PlayerSpawnTile   = require("player_spawn_tile"),
    PortalTile        = require("portal_tile"),
    WallTile          = require("wall_tile"),
    PainTile          = require("pain_tile"),
    GoalTile          = require("goal_tile");

