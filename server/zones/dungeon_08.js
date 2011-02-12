{
    "zoneId":       "zones:8",
    "dimensions":   [ 19, 19 ],
    "music":        "/media/music/dungeon_music.mp3",
    
    "tiles": {
        ".":    "BASE_STONE",

        "0":    "DUNGEON_CEILING",
        "1":    "DUNGEON_WALL_T",
        "2":    "DUNGEON_WALL_TR",
        "3":    "DUNGEON_WALL_R",
        "4":    "DUNGEON_WALL_BR",
        "5":    "DUNGEON_WALL_B",
        "6":    "DUNGEON_WALL_BL",
        "7":    "DUNGEON_WALL_L",
        "8":    "DUNGEON_WALL_TL",
        
        "@":    "DUNGEON_CORNER_TR",
        "*":    "DUNGEON_CORNER_TL",
        "$":    "DUNGEON_CORNER_BR",
        "^":    "DUNGEON_CORNER_BL",
        
        "X":    "HOLE",
        
        "A":    "DUNGEON_DOOR_T",
        "B":    "DUNGEON_OPEN_T",
		"C":    "DUNGEON_DOOR_B",
        "D":    "DUNGEON_OPEN_B",

        "G":    { "class": "PortalTile", "options": { "zone": "zones:7", "image": "sprites.png:6,0", "dropAt": [ 2, 4 ] } },
        "H":    { "class": "PortalTile", "options": { "zone": "zones:7", "image": "sprites.png:6,0", "dropAt": [ 2, 9 ] } }
     
    },
    
    "baseMap":  [   
                    "...................",
                    "...................",
                    "...................",
                    "...................",
                    "...................",
                    "...................",
                    "...................",
                    "...................",
                    "...................",
                    "...................",
                    "...................",
                    "...................",
                    "...................",
                    "...................",
                    "...................",
                    "...................",
                    "...................",
                    "...................",
                    "..................."
                ],
                     
     "objectMap": [  
                    "0000000000000000000",
                    "0811111111111111120",
                    "07               30",
                    "07               30",
                    "07               30",
                    "07               G0",
                    "07               30",
                    "07               30",
                    "07               30",
                    "07               H0",
                    "07               30",
                    "07               30",
                    "07               30",
                    "07               30",
                    "07               30",
                    "07               30",
                    "07               30",
                    "0655555555555555540",
                    "0000000000000000000"
                ]
}