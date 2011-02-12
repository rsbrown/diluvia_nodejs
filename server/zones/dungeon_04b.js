{
    "zoneId":       "zones:4b",
    "dimensions":   [ 5, 6 ],
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

        "F":    { "class": "PortalTile", "options": { "zone": "zones:3", "image": "sprites.png:5,1", "dropAt": [ 9, 2 ] } }
    },
    
    "baseMap":  [   
                    ".....",
                    ".....",
                    ".....",
                    ".....",
                    "....."
                ],
                     
     "objectMap": [  
                    "81112",
                    "7   3",
                    "7   3",
                    "7   3",
                    "65F54"
                ]
}