{
    "zoneId":       "zones:3",
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
        
        "X":    "LAVA",
        
        "A":    "DUNGEON_DOOR_T",
        "B":    "DUNGEON_OPEN_T",
		"C":    "DUNGEON_DOOR_B",
        "D":    "DUNGEON_OPEN_B",

        "F":    { "class": "PortalTile", "options": { "zone": "zones:2", "image": "sprites.png:5,1", "dropAt": [ 9, 2 ] } },
        "J":    { "class": "PortalTile", "options": { "zone": "zones:4b", "image": "sprites.png:4,0", "dropAt": [ 2, 3 ] } },
        "K":    { "class": "PortalTile", "options": { "zone": "zones:4a", "image": "sprites.png:4,0", "dropAt": [ 4, 17 ] } },
        "L":    { "class": "PortalTile", "options": { "zone": "zones:4a", "image": "sprites.png:4,0", "dropAt": [ 14, 17 ] } }
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
                    "...................",
                    "..................."
                ],
                     
     "objectMap": [  
                    "0000000000000000000",
                    "0008K2008J2008L2000",
                    "081$ ^11$ ^11$ ^120",
                    "07XX XXX   XXX XX30",
                    "07XX XXX   XXX XX30",
                    "07XX XXX   XXX XX30",
                    "07XX XXX   XXX XX30",
                    "07XX XXX   XXX XX30",
                    "07XX XXX   XXX XX30",
                    "07XX XXX   XXX XX30",
                    "07XX XXX   XXX XX30",
                    "07               30",
                    "07               30",
                    "0655555@   *5555540",
                    "00000007   30000000",
                    "00000007   30000000",
                    "00000007   30000000",
                    "00000007   30000000",
                    "000000065F540000000",
                    "0000000000000000000"
                ]
}