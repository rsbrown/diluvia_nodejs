{
    "zoneId":       "zones:2",
    "dimensions":   [ 30, 30 ],
    
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


		"9":    { "class": "PortalTile", "options": { "zone": "zones:1", "image": "sprites.png:4,1" } },

		
        "R":    "ROCK",
		"W":    "WATER"
    },
    
    "baseMap":  [   
                    "..............................",
                    "..............................",
                    "..............................",
                    "..............................",
                    "..............................",
                    "..............................",
                    "..............................",
                    "..............................",
                    "..............................",
                    "..............................",
                    "..............................",
                    "..............................",
                    "..............................",
                    "..............................",
                    "..............................",
                    "..............................",
                    "..............................",
                    "..............................",
                    "..............................",
                    "..............................",
                    "..............................",
                    "..............................",
                    "..............................",
                    "..............................",
                    "..............................",
                    "..............................",
                    "..............................",
                    "..............................",
                    "..............................",
                    ".............................."
                ],
    
    "objectMap": [  
                    "811111111111111111111111111112",
                    "7                            3",
                    "7                            3",
                    "7                            3",
                    "7       S                    3",
                    "7                            3",
                    "7                            3",
                    "7                            3",
                    "7                            3",
                    "7                            3",
                    "7                            3",
                    "7                            3",
                    "7                            3",
                    "7                            3",
                    "7                            3",
                    "7                            3",
                    "7                            3",
                    "7                            3",
                    "7                            3",
                    "7                            3",
                    "7                            3",
                    "7                            3",
                    "7                            3",
                    "7                            3",
                    "7                            3",
                    "7       811B111B111B112      3",
                    "7       7             3      3",
                    "7       7             3      3",
                    "7       7             3      3",
					"655555556555555955555545555554"
                ]
}