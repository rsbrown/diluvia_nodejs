{
    "zoneId":       "zones:10",
    "dimensions":   [ 9, 9 ],
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

        "G":    { "class": "PortalTile", "options": { "zone": "zones:7", "image": "sprites.png:7,1", "dropAt": [ 6, 4 ] } },
        "Q":    { "class": "PortalTile", "options": { "zone": "zones:12", "image": "sprites.png:3,1", "dropAt": [ 2, 6 ] } }
        

    },
    
    "LAYER_0":  [   
                    ".........",
                    ".........",
                    ".........",
                    ".........",
                    ".........",
                    ".........",
                    ".........",
                    ".........",
                    "........."
                ],
                     
     "LAYER_1": [  
                    "000000000",
                    "081A1A120",
                    "07     30",
                    "07     30",
                    "0G     30",
                    "07     30",
                    "07     Q0",
                    "0655C5540",
                    "000000000"
                ]
}