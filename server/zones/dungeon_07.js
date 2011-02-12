{
    "zoneId":       "zones:7",
    "dimensions":   [ 9, 19 ],
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
        "E":    "DUNGEON_DOOR_L",

        "G":    { "class": "PortalTile", "options": { "zone": "zones:4a", "image": "sprites.png:5,1", "dropAt": [ 4, 2 ] } },
        
        "Q":    { "class": "PortalTile", "options": { "zone": "zones:8", "image": "sprites.png:7,1", "dropAt": [ 16, 4 ] } },
        "R":    { "class": "PortalTile", "options": { "zone": "zones:8", "image": "sprites.png:7,1", "dropAt": [ 16, 9 ] } },
        "S":    { "class": "PortalTile", "options": { "zone": "zones:10", "image": "sprites.png:6,0", "dropAt": [ 2, 4 ] } }
    },
    
    "baseMap":  [   
                    ".........",
                    ".........",
                    ".........",
                    ".........",
                    ".........",
                    ".........",
                    ".........",
                    ".........",
                    ".........",
                    ".........",
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
                     
     "objectMap": [  
                    "000000000",
                    "081111120",
                    "07     30",
                    "07 X X 30",
                    "0Q X X S0",
                    "07XX XX30",
                    "07XX XX30",
                    "07XX XX30",
                    "07XX XX30",
                    "0R X XX30",
                    "07 X XX30",
                    "07XX XX30",
                    "07XX XX30",
                    "07XX XX30",
                    "07XX XX30",
                    "07XX XX30",
                    "07XX XX30",
                    "0655G5540",
                    "000000000"
                ]
}