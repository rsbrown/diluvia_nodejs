var Tile            = require("tile"),
    WallTile        = require("wall_tile"),
    ActorTile       = require("actor_tile"),
    SpawnTile       = require("spawn_tile"),
    PortalTile      = require("portal_tile"),
    PainTile        = require("pain_tile");

var Defs = module.exports = {
    COMMAND_INTERVAL:       250,
    CLIENT_INTERVAL:        100,
        
    Tiles: {
        PLAYER:             new ActorTile({ image: "sprites.png:5,4" }),
        PLAYER_N:           new ActorTile({ image: "dude.png:0,0" }),
        PLAYER_S:           new ActorTile({ image: "dude.png:2,0" }),
        PLAYER_E:           new ActorTile({ image: "dude.png:1,0" }),
        PLAYER_W:           new ActorTile({ image: "dude.png:3,0" }),
        SPAWN:              new SpawnTile({ image: "sprites.png:2,8" }),
        ROCK:               new WallTile({ image: "sprites.png:3,4" }),
        BASE_GRASS:         new Tile({ image: "sprites.png:2,7" }),
        BASE_EMPTY:         new Tile({ image: "sprites.png:4,5" }),
        BASE_STONE:         new Tile({ image: "sprites.png:4,7" }),
		SPAWN_STONE:        new SpawnTile({ image: "sprites.png:4,7" }),
		SPAWN_GRASS:        new SpawnTile({ image: "sprites.png:2,7" }),
		EMPTY_WALL:         new WallTile({ image: "sprites.png:0,6" }),

		TREE_1: 			new WallTile({ image: "sprites.png:3,2" }),
		TREE_2: 			new WallTile({ image: "sprites.png:4,2" }),
		TREE_3: 			new WallTile({ image: "sprites.png:3,3" }),
		TREE_4: 			new WallTile({ image: "sprites.png:4,3" }),

		DUNGEON_TOWER_1_1:  new WallTile({ image: "sprites.png:0,2" }),
		DUNGEON_TOWER_1_2:  new WallTile({ image: "sprites.png:1,2" }),
		DUNGEON_TOWER_1_3:  new WallTile({ image: "sprites.png:2,2" }),
		DUNGEON_TOWER_2_1:  new WallTile({ image: "sprites.png:0,3" }),	
		DUNGEON_TOWER_2_2:  new WallTile({ image: "sprites.png:1,3" }),
		DUNGEON_TOWER_2_3:  new WallTile({ image: "sprites.png:2,3" }),
		DUNGEON_TOWER_3_1:  new WallTile({ image: "sprites.png:0,4" }),
		DUNGEON_TOWER_3_2:  new WallTile({ image: "sprites.png:1,4" }),
		DUNGEON_TOWER_3_3:  new WallTile({ image: "sprites.png:2,4" }),
        DUNGEON_TOWER_4_1:  new WallTile({ image: "sprites.png:0,5" }),
        DUNGEON_TOWER_4_3:  new WallTile({ image: "sprites.png:2,5" }),

        DUNGEON_WALL_T:     new WallTile({ image: "sprites.png:2,0" }),
        DUNGEON_WALL_TR:    new WallTile({ image: "sprites.png:1,0" }),
        DUNGEON_WALL_R:     new WallTile({ image: "sprites.png:3,1" }),
        DUNGEON_WALL_BR:    new WallTile({ image: "sprites.png:1,1" }),
        DUNGEON_WALL_B:     new WallTile({ image: "sprites.png:2,1" }),
        DUNGEON_WALL_BL:    new WallTile({ image: "sprites.png:0,1" }),
        DUNGEON_WALL_L:     new WallTile({ image: "sprites.png:3,0" }),
        DUNGEON_WALL_TL:    new WallTile({ image: "sprites.png:0,0" }),
        
        DUNGEON_CORNER_TR:  new WallTile({ image: "sprites.png:11,0" }),
        DUNGEON_CORNER_TL:  new WallTile({ image: "sprites.png:10,0" }),
        DUNGEON_CORNER_BR:  new WallTile({ image: "sprites.png:11,1" }),
        DUNGEON_CORNER_BL:  new WallTile({ image: "sprites.png:10,1" }),
        
		DUNGEON_DOOR_T:     new WallTile({ image: "sprites.png:5,0" }),
		DUNGEON_OPEN_T:     new WallTile({ image: "sprites.png:4,0" }),
		DUNGEON_DOOR_R:     new WallTile({ image: "sprites.png:4,1" }),
		DUNGEON_OPEN_R:     new WallTile({ image: "sprites.png:5,1" }),
		DUNGEON_DOOR_B:     new WallTile({ image: "sprites.png:6,1" }),
		DUNGEON_OPEN_B:     new WallTile({ image: "sprites.png:6,0" }),
		DUNGEON_DOOR_L:     new WallTile({ image: "sprites.png:7,0" }),
		DUNGEON_OPEN_L:     new WallTile({ image: "sprites.png:7,1" }),
		
		
		DUNGEON_CEILING:    new WallTile({ image: "sprites.png:0,9" }),

        PORTAL:             new PortalTile({ image: "sprites.png:2,8" }),
		WATER:              new WallTile({ image: "sprites.png:0,7" }),
		LAVA:               new PainTile({ image: "sprites.png:8,7" })
    }
};
