
{
    "zoneId":       "zones:2",
    "dimensions":   [ 15, 10 ],
    
    "tiles": {
        "_":    "BASE_GRASS",
		".":    "BASE_STONE",
        "S":    "SPAWN_STONE",

		"0":    "DUNGEON_CEILING",
        "1":    "DUNGEON_WALL_T",
        "2":    "DUNGEON_WALL_TR",
        "3":    "DUNGEON_WALL_R",
        "4":    "DUNGEON_WALL_BR",
        "5":    "DUNGEON_WALL_B",
        "6":    "DUNGEON_WALL_BL",
        "7":    "DUNGEON_WALL_L",
        "8":    "DUNGEON_WALL_TL",

		"A":    "DUNGEON_DOOR_T",
        "B":    "DUNGEON_OPEN_T",
        "C":    "DUNGEON_DOOR_R",
        "D":    "DUNGEON_OPEN_R",
		"E":    "DUNGEON_DOOR_B",
        "F":    "DUNGEON_OPEN_B",
        "G":    "DUNGEON_DOOR_L",
        "H":    "DUNGEON_OPEN_L",
        
        
        "Y":    { "class": "PortalTile", "options": { "zone": "zones:2", "image": "sprites.png:4,0", "dropAt": [ 2, 2 ] } },
        "Z":    { "class": "PortalTile", "options": { "zone": "zones:3", "image": "sprites.png:4,0", "dropAt": [ 2, 2 ] } },
        
		"9":    { "class": "PortalTile", "options": { "zone": "zones:0", "image": "sprites.png:4,1", "dropAt": [ 18, 9 ] } },

		
        "R":    "ROCK",
		"W":    "WATER"
    },
    
    "baseMap":  [   
                    "...............",
                    "...............",
                    "...............",
                    "...............",
                    "...............",
                    "...............",
                    "...............",
                    "...............",
                    "...............",
                    "..............."
                ],
    
    "objectMap": [  
                    "811111111111112",
                    "7             3",
                    "7             3",
                    "7             3",
                    "7             3",
                    "7             3",
                    "7             3",
                    "7             3",
                    "7             3",
                    "655E55555555554"
                ]
}