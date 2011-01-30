
{
    "zoneId":       "zones:3",
    "dimensions":   [ 7, 7 ],
    
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

        "F":    { "class": "PortalTile", "options": { "zone": "zones:1", "image": "sprites.png:5,1", "dropAt": [ 19, 16 ] } }
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
                    "8111112",
                    "7     3",
                    "7     3",
                    "7     3",
                    "7     3",
                    "7     3",
                    "655F554"
                ]
}