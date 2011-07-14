{
    "zoneId":       "zones:12",
    "dimensions":   [ 19, 9 ],
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
        
        "X":    "VOID",
        
        "A":    "DUNGEON_DOOR_T",
        "B":    "DUNGEON_OPEN_T",
		"C":    "DUNGEON_DOOR_B",
        "D":    "DUNGEON_OPEN_B",
        
        "E":    "DUNGEON_DOOR_R",

        "G":    { "class": "PortalTile", "options": { "zone": "zones:5", "image": "sprites.png:5,1", "dropAt": [ 4, 2 ] } },
        
        "Q":    { "class": "PortalTile", "options": { "zone": "zones:10", "image": "sprites.png:3,0", "dropAt": [ 6, 6 ] } }
        

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
                    "..................."
                ],
                     
     "objectMap": [  
                    "0000000000000000000",
                    "0008120811111111120",
                    "0007 307         30",
                    "0007 307         E0",
                    "0007 307         30",
                    "081$ ^1$   *5555540",
                    "0Q         30000000",
                    "0655G55555540000000",
                    "0000000000000000000"
                ]
}