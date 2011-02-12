{
    "zoneId":       "zones:2",
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
        
        "X":    "RABBIT",
        
        "A":    "DUNGEON_DOOR_T",
        "B":    "DUNGEON_OPEN_T",
		"C":    "DUNGEON_DOOR_B",
        "D":    "DUNGEON_OPEN_B",

        "F":    { "class": "PortalTile", "options": { "zone": "zones:1", "image": "sprites.png:5,1", "dropAt": [ 9, 2 ] } },
        "G":    { "class": "PortalTile", "options": { "zone": "zones:3", "image": "sprites.png:4,0", "dropAt": [ 9, 16 ] } }
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
                    "081B12811G11281B120",
                    "07   37     37   30",
                    "07   37     37   30",
                    "07   37     37   30",
                    "07   37     37   30",
                    "07   37     37   30",
                    "065C54655F55465C540",
                    "0000000000000000000"
                ]
}