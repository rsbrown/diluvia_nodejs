{
    "zoneId":       "zones:4a",
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

        "F":    { "class": "PortalTile", "options": { "zone": "zones:3", "image": "sprites.png:5,1", "dropAt": [ 9, 2 ] } },
        "G":    { "class": "PortalTile", "options": { "zone": "zones:3", "image": "sprites.png:5,1", "dropAt": [ 4, 2 ] } },
        "H":    { "class": "PortalTile", "options": { "zone": "zones:3", "image": "sprites.png:5,1", "dropAt": [ 14, 2 ] } },
        
        "K":    { "class": "PortalTile", "options": { "zone": "zones:7", "image": "sprites.png:4,0", "dropAt": [ 4, 16 ] } },
        "L":    { "class": "PortalTile", "options": { "zone": "zones:7", "image": "sprites.png:4,0", "dropAt": [ 4, 2 ] } },
        
        "Q":    { "class": "PortalTile", "options": { "zone": "zones:5", "image": "sprites.png:6,0", "dropAt": [ 2, 8 ] } },
        "R":    { "class": "PortalTile", "options": { "zone": "zones:5", "image": "sprites.png:6,0", "dropAt": [ 2, 13 ] } }
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
                    "0811K111111111L1120",
                    "07XX XXXXXXXXX XX30",
                    "07XX XXXXXXXXX XX30",
                    "07XX           XX30",
                    "07XXXXXXXXXXXX XX30",
                    "07  XXXXXXXXXX XX30",
                    "07 XX        X XX30",
                    "07 XXX           Q0",
                    "07 XXX       XXXX30",
                    "07 X         XXXX30",
                    "07 X XXXXXXXXXXXX30",
                    "07 X XXXXXXXXX XX30",
                    "07   XX*555@XX   R0",
                    "07XX XX30007XX XX30",
                    "07XX XX30007XX XX30",
                    "07XX XX30007XX XX30",
                    "0655G554000655H5540",
                    "0000000000000000000"
                ]
}