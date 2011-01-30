{
    "zoneId":       "zones:0",
    "dimensions":   [ 30, 20 ],
    "background":   "background_island.png",
    
    "tiles": {
        "Z":    { "class": "PortalTile", "options": { "zone": "zones:666", "dropAt": [ 3, 3 ] } },
        "S":    "SPAWN",
        "_":    "BASE_EMPTY",
        ".":    "BASE_STONE",
        "A":    "DUNGEON_TOWER_1_1",
        "B":    "DUNGEON_TOWER_1_2",
        "C":    "DUNGEON_TOWER_1_3",
        "D":    "DUNGEON_TOWER_2_1",
        "E":    "DUNGEON_TOWER_2_2",
        "F":    "DUNGEON_TOWER_2_3",
        "G":    "DUNGEON_TOWER_3_1",
        "H":    "DUNGEON_TOWER_3_2",
		"I":    "DUNGEON_TOWER_3_3",
		"J":    "DUNGEON_TOWER_4_1",
		"K":    { "class": "PortalTile", "options": { "zone": "zones:2", "image": "sprites.png:1,5" } },
		"L":    "DUNGEON_TOWER_4_3",
		"1":    "TREE_1",
		"2":    "TREE_2",
        "3":    "TREE_3",
		"4":    "TREE_4",
        "R":    "ROCK",
		"W":    "WATER"
    },
    
    "baseMap":  [   
                    "__________",
                    "__________",
                    "__________",
                    "__________",
                    "__________",
                    "__________",
                    "__________",
                    "__________",
                    "__________",
                    "__________"
                ],
    
    "objectMap": [  
                    "WWWWWWWWWW",
                    "W        W",
                    "W ABC    W",
                    "W DEF 12 W",
                    "W GHI 34 W",
                    "W JKL    W",
                    "W        W",
                    "W   R    W",
                    "W      S W",
					"WWWWWWWWWW"
                ]
}