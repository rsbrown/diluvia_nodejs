var Tile            = require("tile"),
    WallTile        = require("wall_tile"),
    ActorTile       = require("actor_tile"),
    SpawnTile       = require("spawn_tile"),
    PortalTile      = require("portal_tile");

var Defs = module.exports = {
    COMMAND_INTERVAL:  250,
    CLIENT_INTERVAL:   100,
            
    Tiles: {
        PLAYER:             new ActorTile({ image: "sprites.png:5,4" }),
        SPAWN:              new SpawnTile({ image: "sprites.png:2,8" }),
        BASE_GRASS:         new Tile({ image: "sprites.png:3,7" }),
        BASE_STONE:         new Tile({ image: "sprites.png:4,7" }),
        DUNGEON_WALL_T:     new WallTile({ image: "sprites.png:2,0" }),
        DUNGEON_WALL_TR:    new WallTile({ image: "sprites.png:1,0" }),
        DUNGEON_WALL_R:     new WallTile({ image: "sprites.png:3,1" }),
        DUNGEON_WALL_BR:    new WallTile({ image: "sprites.png:1,1" }),
        DUNGEON_WALL_B:     new WallTile({ image: "sprites.png:2,1" }),
        DUNGEON_WALL_BL:    new WallTile({ image: "sprites.png:0,1" }),
        DUNGEON_WALL_L:     new WallTile({ image: "sprites.png:3,0" }),
        DUNGEON_WALL_TL:    new WallTile({ image: "sprites.png:0,0" }),
        PORTAL:             new PortalTile({ image: "sprites.png:2,8" })
    }
};
