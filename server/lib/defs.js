var _ = require("underscore");

var Defs = module.exports = {
    ROLE_ASSASSIN:          1,
    ROLE_SEEKER:            2,
    
    COMMAND_INTERVAL:       250,
    CLIENT_INTERVAL:        100,
    WORLD_FAST_INTERVAL:    25,
    WORLD_SLOW_INTERVAL:    500,
    MAX_GOAL_COUNTER:       30000,
    GIT_REVISION:           "unresolved",
    SPAWN_SWORD:            false,
    
    REWARD_POISONER:        5,
    
    PORTAL_INVULN_DELAY:    1000,
    MAX_HITPOINTS:          9999,
    
    PAIN_TILE_DAMAGE:       25,
    PAIN_TILE_INTERVAL:     1000,
    
    LAYER_COUNT:            3,
    BASE_LAYER:             0,
    OBJECT_LAYER:           1,
    ACTOR_LAYER:            2,
    
    CHAT_PLAYER:            "white",
    CHAT_SYSTEM:            "#BBBBBB",
    CHAT_CRITICAL:          "red",
    CHAT_ALERT:             "#FFCC33", // orange-yellow-ish
    CHAT_INFO:              "#00CC00"
};

// if we require these first, none of the defs will be set when the tile
// code is loaded, so we first set all the basic defs, then load the tiles --RB
var Tile            = require("tile"),
    WallTile        = require("wall_tile"),
    ActorTile       = require("actor_tile"),
    SpawnTile       = require("spawn_tile"),
    PortalTile      = require("portal_tile"),
    PainTile        = require("pain_tile"),
    Spell           = require("spell");

Defs.Tiles =     { 
  1: 
   { class: 'ActorTile',
     image: 'dude.png:0,0',
     name: 'PLAYER_N' },
  2: 
   { class: 'ActorTile',
     image: 'dude.png:2,0',
     name: 'PLAYER_S' },
  3: 
   { class: 'ActorTile',
     image: 'dude.png:1,0',
     name: 'PLAYER_E' },
  4: 
   { class: 'ActorTile',
     image: 'dude.png:3,0',
     name: 'PLAYER_W' },
  5: 
   { class: 'SpawnTile',
     image: 'sprites.png:2,8',
     name: 'SPAWN' },
  6: 
   { class: 'WallTile',
     image: 'sprites.png:3,4',
     name: 'Rock' },
  7: 
   { class: 'Tile',
     image: 'sprites.png:0,9',
     name: 'Empty' },
  8: 
   { class: 'Tile',
     image: 'sprites.png:0,7',
     name: 'BASE_WATER' },
  9: 
   { class: 'Tile',
     image: 'sprites.png:2,7',
     name: 'Grass' },
  10: 
   { class: 'Tile',
     image: 'sprites.png:4,7',
     name: 'BASE_STONE' },
  11: 
   { class: 'SpawnTile',
     image: 'sprites.png:4,7',
     name: 'SPAWN_STONE' },
  12: 
   { class: 'SpawnTile',
     image: 'sprites.png:2,7',
     name: 'SPAWN_GRASS' },
  13: 
   { class: 'WallTile',
     image: 'sprites.png:0,6',
     name: 'EMPTY_WALL' },
  14: 
   { class: 'Tile',
     image: 'sprites.png:0,6',
     name: 'Empty' },
  15: 
   { class: 'WallTile',
     image: 'sprites.png:3,2',
     name: 'TREE_1' },
  16: 
   { class: 'WallTile',
     image: 'sprites.png:4,2',
     name: 'TREE_2' },
  17: 
   { class: 'WallTile',
     image: 'sprites.png:3,3',
     name: 'TREE_3' },
  18: 
   { class: 'WallTile',
     image: 'sprites.png:4,3',
     name: 'TREE_4' },
  19: 
   { class: 'Tile',
     image: 'sprites.png:8,2',
     name: 'FUZZY_1' },
  20: 
   { class: 'WallTile',
     image: 'sprites.png:8,3',
     name: 'FUZZY_2' },
  21: 
   { class: 'WallTile',
     image: 'sprites.png:8,4',
     name: 'FUZZY_3' },
  22: 
   { class: 'Tile',
     image: 'sprites.png:9,2',
     name: 'FUZZY_4' },
  23: 
   { class: 'WallTile',
     image: 'sprites.png:9,3',
     name: 'FUZZY_5' },
  24: 
   { class: 'WallTile',
     image: 'sprites.png:9,4',
     name: 'FUZZY_6' },
  25: 
   { class: 'Tile',
     image: 'sprites.png:10,2',
     name: 'MONSTER_1' },
  26: 
   { class: 'WallTile',
     image: 'sprites.png:10,3',
     name: 'MONSTER_2' },
  27: 
   { class: 'WallTile',
     image: 'sprites.png:10,4',
     name: 'MONSTER_3' },
  28: 
   { class: 'Tile',
     image: 'sprites.png:11,2',
     name: 'MONSTER_4' },
  29: 
   { class: 'WallTile',
     image: 'sprites.png:11,3',
     name: 'MONSTER_5' },
  30: 
   { class: 'WallTile',
     image: 'sprites.png:11,4',
     name: 'MONSTER_6' },
  31: 
   { class: 'WallTile',
     image: 'sprites.png:4,4',
     name: 'RABBIT' },
  32: 
   { class: 'WallTile',
     image: 'sprites.png:4,5',
     name: 'SNAIL' },
  33: 
   { class: 'WallTile',
     image: 'sprites.png:0,2',
     name: 'DUNGEON_TOWER_1_1' },
  34: 
   { class: 'WallTile',
     image: 'sprites.png:1,2',
     name: 'DUNGEON_TOWER_1_2' },
  35: 
   { class: 'WallTile',
     image: 'sprites.png:2,2',
     name: 'DUNGEON_TOWER_1_3' },
  36: 
   { class: 'WallTile',
     image: 'sprites.png:0,3',
     name: 'DUNGEON_TOWER_2_1' },
  37: 
   { class: 'WallTile',
     image: 'sprites.png:1,3',
     name: 'DUNGEON_TOWER_2_2' },
  38: 
   { class: 'WallTile',
     image: 'sprites.png:2,3',
     name: 'DUNGEON_TOWER_2_3' },
  39: 
   { class: 'WallTile',
     image: 'sprites.png:0,4',
     name: 'DUNGEON_TOWER_3_1' },
  40: 
   { class: 'WallTile',
     image: 'sprites.png:1,4',
     name: 'DUNGEON_TOWER_3_2' },
  41: 
   { class: 'WallTile',
     image: 'sprites.png:2,4',
     name: 'DUNGEON_TOWER_3_3' },
  42: 
   { class: 'WallTile',
     image: 'sprites.png:0,5',
     name: 'DUNGEON_TOWER_4_1' },
  43: 
   { class: 'PortalTile',
     image: 'sprites.png:1,5',
     name: 'DUNGEON_TOWER_4_2' },
  44: 
   { class: 'WallTile',
     image: 'sprites.png:2,5',
     name: 'DUNGEON_TOWER_4_3' },
  45: 
   { class: 'WallTile',
     image: 'sprites.png:2,0',
     name: 'DUNGEON_WALL_T' },
  46: 
   { class: 'WallTile',
     image: 'sprites.png:1,0',
     name: 'DUNGEON_WALL_TR' },
  47: 
   { class: 'WallTile',
     image: 'sprites.png:3,1',
     name: 'DUNGEON_WALL_R' },
  48: 
   { class: 'WallTile',
     image: 'sprites.png:1,1',
     name: 'DUNGEON_WALL_BR' },
  49: 
   { class: 'WallTile',
     image: 'sprites.png:2,1',
     name: 'DUNGEON_WALL_B' },
  50: 
   { class: 'WallTile',
     image: 'sprites.png:0,1',
     name: 'DUNGEON_WALL_BL' },
  51: 
   { class: 'WallTile',
     image: 'sprites.png:3,0',
     name: 'DUNGEON_WALL_L' },
  52: 
   { class: 'WallTile',
     image: 'sprites.png:0,0',
     name: 'DUNGEON_WALL_TL' },
  53: 
   { class: 'WallTile',
     image: 'sprites.png:11,0',
     name: 'DUNGEON_CORNER_TR' },
  54: 
   { class: 'WallTile',
     image: 'sprites.png:10,0',
     name: 'DUNGEON_CORNER_TL' },
  55: 
   { class: 'WallTile',
     image: 'sprites.png:11,1',
     name: 'DUNGEON_CORNER_BR' },
  56: 
   { class: 'WallTile',
     image: 'sprites.png:10,1',
     name: 'DUNGEON_CORNER_BL' },
  57: 
   { class: 'WallTile',
     image: 'sprites.png:5,0',
     name: 'DUNGEON_DOOR_T' },
  58: 
   { class: 'WallTile',
     image: 'sprites.png:4,0',
     name: 'DUNGEON_OPEN_T' },
  59: 
   { class: 'WallTile',
     image: 'sprites.png:9,0',
     name: 'DUNGEON_EXIT_T' },
  60: 
   { class: 'WallTile',
     image: 'sprites.png:6,1',
     name: 'DUNGEON_DOOR_R' },
  61: 
   { class: 'WallTile',
     image: 'sprites.png:6,0',
     name: 'DUNGEON_OPEN_R' },
  62: 
   { class: 'WallTile',
     image: 'sprites.png:8,0',
     name: 'DUNGEON_EXIT_R' },
  63: 
   { class: 'WallTile',
     image: 'sprites.png:4,1',
     name: 'DUNGEON_DOOR_B' },
  64: 
   { class: 'WallTile',
     image: 'sprites.png:5,1',
     name: 'DUNGEON_OPEN_B' },
  65: 
   { class: 'WallTile',
     image: 'sprites.png:8,1',
     name: 'DUNGEON_EXIT_B' },
  66: 
   { class: 'WallTile',
     image: 'sprites.png:7,0',
     name: 'DUNGEON_DOOR_L' },
  67: 
   { class: 'WallTile',
     image: 'sprites.png:7,1',
     name: 'DUNGEON_OPEN_L' },
  68: 
   { class: 'WallTile',
     image: 'sprites.png:13,7',
     name: 'BORDER_T' },
  69: 
   { class: 'WallTile',
     image: 'sprites.png:13,8',
     name: 'BORDER_B' },
  70: 
   { class: 'WallTile',
     image: 'sprites.png:14,7',
     name: 'BORDER_R' },
  71: 
   { class: 'WallTile',
     image: 'sprites.png:14,8',
     name: 'BORDER_L' },
  72: 
   { class: 'WallTile',
     image: 'sprites.png:15,7',
     name: 'BORDER_TL' },
  73: 
   { class: 'WallTile',
     image: 'sprites.png:15,8',
     name: 'BORDER_BL' },
  74: 
   { class: 'WallTile',
     image: 'sprites.png:16,7',
     name: 'BORDER_TR' },
  75: 
   { class: 'WallTile',
     image: 'sprites.png:16,8',
     name: 'BORDER_BR' },
  76: 
   { class: 'WallTile',
     image: 'sprites.png:12,7',
     name: 'DUNGEON_CEILING' },
  77: 
   { class: 'PortalTile',
     image: 'sprites.png:2,8',
     name: 'PORTAL' },
  78: 
   { class: 'WallTile',
     image: 'sprites.png:0,7',
     name: 'WATER' },
  79: 
   { class: 'PainTile',
     image: 'sprites.png:8,7',
     damage: 10,
     interval: 200,
     name: 'LAVA' },
  80: 
   { class: 'PainTile',
     image: 'sprites.png:12,8',
     damage: -1,
     name: 'VOID' },
  81: 
   { class: 'GoalTile',
     image: 'sprites.png:3,6',
     goalType: 'treasure',
     name: 'TREASURE' },
  82: 
   { class: 'GoalTile',
     image: 'sprites.png:5,5',
     goalType: 'skull',
     name: 'SKULL' },
  83: 
   { class: 'GoalTile',
     image: 'sprites.png:3,5',
     goalType: 'sword',
     name: 'Sword' } ,
     
  84: 
  { class: 'WallTile',
    image: 'sprites.png:12,0',
    name: 'DUNGEON_SINGLE_1' },
  85: 
  { class: 'WallTile',
    image: 'sprites.png:13,0',
    name: 'DUNGEON_SINGLE_2' },
  86: 
  { class: 'WallTile',
    image: 'sprites.png:14,0',
    name: 'DUNGEON_SINGLE_3' },
  87: 
  { class: 'WallTile',
    image: 'sprites.png:12,1',
    name: 'DUNGEON_SINGLE_4' },
  88: 
  { class: 'WallTile',
    image: 'sprites.png:13,1',
    name: 'DUNGEON_SINGLE_5' },
  89: 
  { class: 'WallTile',
    image: 'sprites.png:14,1',
    name: 'DUNGEON_SINGLE_6' },
  90: 
  { class: 'WallTile',
    image: 'sprites.png:15,0',
    name: 'DUNGEON_SINGLE_7' },
  91: 
  { class: 'WallTile',
    image: 'sprites.png:15,1',
    name: 'DUNGEON_SINGLE_8' },
  92: 
  { class: 'WallTile',
    image: 'sprites.png:16,0',
    name: 'DUNGEON_SINGLE_9' },
  93: 
  { class: 'WallTile',
    image: 'sprites.png:16,1',
    name: 'DUNGEON_SINGLE_10' }

};

Defs.SPELLS = {
    ASSASSIN_POISON: new Spell({
        name:               'ASSASSIN_POISON',
        type:               'malicious',
        duration:           {
            period:         5000,
            tics:           3,
            triggerOnLand:  false,
            triggerOnFade:  false,
            refreshable:    false
        },
        affects: {
            hitpoints: -34
        },
        display: {
            casted: {
                caster: {
                    flash: 'purple',
                    message: 'You have POISONed %t!!'
                }
            },
            damaged: {
                target: {
                    flash: 'green',
                    message: 'POISON courses through your veins!'
                }
            },
            faded: {
                target: {
                    message: 'The POISON seems to have faded.'
                }
            },
            completed: {
                caster: {
                    message: 'You gained points from POISONing %t!'
                }                
            },
            died: {
                target: {
                    message: 'You have died from POISON!'
                }
            }
        }
    })
};
