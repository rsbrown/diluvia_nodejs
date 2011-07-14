{
    "zoneId":       "zones:5",
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
        
        "X":    "VOID",
        
        "A":    "DUNGEON_DOOR_T",
        "B":    "DUNGEON_OPEN_T",
		"C":    "DUNGEON_DOOR_B",
        "D":    "DUNGEON_OPEN_B",

        "G":    { "class": "PortalTile", "options": { "zone": "zones:4a", "image": "sprites.png:7,1", "dropAt": [ 16, 8 ] } },
        "H":    { "class": "PortalTile", "options": { "zone": "zones:4a", "image": "sprites.png:7,1", "dropAt": [ 16, 13 ] } },
        
        "Q":    { "class": "PortalTile", "options": { "zone": "zones:11", "image": "sprites.png:4,0", "dropAt": [ 4, 6 ] } },
        "R":    { "class": "PortalTile", "options": { "zone": "zones:6", "image": "sprites.png:3,1", "dropAt": [ 2, 3 ] } }
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
                    "0811Q1120",
                    "07     30",
                    "07     30",
                    "07     30",
                    "07     30",
                    "07     30",
                    "07     30",
                    "0G     30",
                    "07     30",
                    "065555540",
                    "081111120",
                    "07     30",
                    "0H     R0",
                    "07     30",
                    "07     30",
                    "07     30",
                    "0655C5540",
                    "000000000"
                ]
}