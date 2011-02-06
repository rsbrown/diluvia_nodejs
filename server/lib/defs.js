var Tile            = require("tile"),
    WallTile        = require("wall_tile"),
    ActorTile       = require("actor_tile"),
    SpawnTile       = require("spawn_tile"),
    PortalTile      = require("portal_tile"),
    PainTile        = require("pain_tile");

var Defs = module.exports = {
    ROLE_ASSASSIN:          1,
    ROLE_SEEKER:            2,
    
    COMMAND_INTERVAL:       250,
    CLIENT_INTERVAL:        100,
    WORLD_FAST_INTERVAL:    25,
    WORLD_SLOW_INTERVAL:    500,
    MAX_GOAL_COUNTER:       30000,
    GIT_REVISION:           "unresolved",
    POISON_DEATH_DELAY:     7500,
    
    REWARD_POISONER:        5,
    
    PORTAL_INVULN_DELAY:    2000,
    
    LAYER_COUNT:            3,
    BASE_LAYER:             0,
    OBJECT_LAYER:           1,
    ACTOR_LAYER:            2,
    
    CHAT_PLAYER:            "white",
    CHAT_SYSTEM:            "#BBBBBB",
    CHAT_CRITICAL:          "red",
    CHAT_ALERT:             "#FFCC33", // orange-yellow-ish
    CHAT_INFO:              "#00CC00",

    Tiles: {
        PLAYER:             { class: "ActorTile",   image: "dude.png:0,0" },
        PLAYER_N:           { class: "ActorTile",   image: "dude.png:0,0" },
        PLAYER_S:           { class: "ActorTile",   image: "dude.png:2,0" },
        PLAYER_E:           { class: "ActorTile",   image: "dude.png:1,0" },
        PLAYER_W:           { class: "ActorTile",   image: "dude.png:3,0" },
        SPAWN:              { class: "SpawnTile",   image: "sprites.png:2,8" },
        ROCK:               { class: "WallTile",    image: "sprites.png:3,4" },
        BASE_GRASS:         { class: "Tile",        image: "sprites.png:2,7" },
        BASE_EMPTY:         { class: "Tile",        image: "sprites.png:0,9" },
        BASE_STONE:         { class: "Tile",        image: "sprites.png:4,7" },
		SPAWN_STONE:        { class: "SpawnTile",   image: "sprites.png:4,7" },
		SPAWN_GRASS:        { class: "SpawnTile",   image: "sprites.png:2,7" },
		EMPTY_WALL:         { class: "WallTile",    image: "sprites.png:0,6" },

		TREE_1: 			{ class: "WallTile",    image: "sprites.png:3,2" },
		TREE_2: 			{ class: "WallTile",    image: "sprites.png:4,2" },
		TREE_3: 			{ class: "WallTile",    image: "sprites.png:3,3" },
		TREE_4: 			{ class: "WallTile",    image: "sprites.png:4,3" },
		
		FUZZY_1:            { class: "Tile",        image: "sprites.png:8,2" },
		FUZZY_2:            { class: "WallTile",    image: "sprites.png:8,3" },
		FUZZY_3:            { class: "WallTile",    image: "sprites.png:8,4" },
		FUZZY_4:            { class: "Tile",        image: "sprites.png:9,2" },
		FUZZY_5:            { class: "WallTile",    image: "sprites.png:9,3" },
		FUZZY_6:            { class: "WallTile",    image: "sprites.png:9,4" },  
		
		
		MONSTER_1:          { class: "Tile",        image: "sprites.png:10,2" },
		MONSTER_2:          { class: "WallTile",    image: "sprites.png:10,3" },
		MONSTER_3:          { class: "WallTile",    image: "sprites.png:10,4" },
		MONSTER_4:          { class: "Tile",        image: "sprites.png:11,2" },
		MONSTER_5:          { class: "WallTile",    image: "sprites.png:11,3" },
		MONSTER_6:          { class: "WallTile",    image: "sprites.png:11,4" },
		
		RABBIT:             { class: "WallTile",    image: "sprites.png:4,4" },
		SNAIL:              { class: "WallTile",    image: "sprites.png:4,5" },	

		DUNGEON_TOWER_1_1:  { class: "WallTile",    image: "sprites.png:0,2" },
		DUNGEON_TOWER_1_2:  { class: "WallTile",    image: "sprites.png:1,2" },
		DUNGEON_TOWER_1_3:  { class: "WallTile",    image: "sprites.png:2,2" },
		DUNGEON_TOWER_2_1:  { class: "WallTile",    image: "sprites.png:0,3" },	
		DUNGEON_TOWER_2_2:  { class: "WallTile",    image: "sprites.png:1,3" },
		DUNGEON_TOWER_2_3:  { class: "WallTile",    image: "sprites.png:2,3" },
		DUNGEON_TOWER_3_1:  { class: "WallTile",    image: "sprites.png:0,4" },
		DUNGEON_TOWER_3_2:  { class: "WallTile",    image: "sprites.png:1,4" },
		DUNGEON_TOWER_3_3:  { class: "WallTile",    image: "sprites.png:2,4" },
        DUNGEON_TOWER_4_1:  { class: "WallTile",    image: "sprites.png:0,5" },
        DUNGEON_TOWER_4_3:  { class: "WallTile",    image: "sprites.png:2,5" },

        DUNGEON_WALL_T:     { class: "WallTile",    image: "sprites.png:2,0" },
        DUNGEON_WALL_TR:    { class: "WallTile",    image: "sprites.png:1,0" },
        DUNGEON_WALL_R:     { class: "WallTile",    image: "sprites.png:3,1" },
        DUNGEON_WALL_BR:    { class: "WallTile",    image: "sprites.png:1,1" },
        DUNGEON_WALL_B:     { class: "WallTile",    image: "sprites.png:2,1" },
        DUNGEON_WALL_BL:    { class: "WallTile",    image: "sprites.png:0,1" },
        DUNGEON_WALL_L:     { class: "WallTile",    image: "sprites.png:3,0" },
        DUNGEON_WALL_TL:    { class: "WallTile",    image: "sprites.png:0,0" },
        
        DUNGEON_CORNER_TR:  { class: "WallTile",    image: "sprites.png:11,0" },
        DUNGEON_CORNER_TL:  { class: "WallTile",    image: "sprites.png:10,0" },
        DUNGEON_CORNER_BR:  { class: "WallTile",    image: "sprites.png:11,1" },
        DUNGEON_CORNER_BL:  { class: "WallTile",    image: "sprites.png:10,1" },
        
		DUNGEON_DOOR_T:     { class: "WallTile",    image: "sprites.png:5,0" },
		DUNGEON_OPEN_T:     { class: "WallTile",    image: "sprites.png:4,0" },
		DUNGEON_DOOR_R:     { class: "WallTile",    image: "sprites.png:4,1" },
		DUNGEON_OPEN_R:     { class: "WallTile",    image: "sprites.png:5,1" },
		DUNGEON_DOOR_B:     { class: "WallTile",    image: "sprites.png:6,0" },
		DUNGEON_OPEN_B:     { class: "WallTile",    image: "sprites.png:5,1" },
		DUNGEON_DOOR_L:     { class: "WallTile",    image: "sprites.png:7,0" },
		DUNGEON_OPEN_L:     { class: "WallTile",    image: "sprites.png:7,1" },
		
		
		DUNGEON_CEILING:    { class: "WallTile",    image: "sprites.png:12,7" },

        PORTAL:             { class: "PortalTile",  image: "sprites.png:2,8" },
		WATER:              { class: "WallTile",    image: "sprites.png:0,7" },
		LAVA:               { class: "PainTile",    image: "sprites.png:8,7" },
		
		SKULL:           { class: "GoalTile",    image: "sprites.png:5,5" }
    }
};
