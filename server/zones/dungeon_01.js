{
    "zoneId":       "zones:1",
    "name":         "Dungeon1",
    "dimensions":   [ 19, 9 ],
    "music":        "/media/music/dungeon_music.mp3",
    
    "tiles": {
		".":    "BASE_STONE",
        "T":    "SPAWN_STONE",

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
        
        "N":    "MONSTER_1",
        "O":    "MONSTER_2",
        "P":    "MONSTER_3",
        "Q":    "MONSTER_4",
        "R":    "MONSTER_5",
        "S":    "MONSTER_6",
        
        "A":    "DUNGEON_DOOR_T",
        "B":    "DUNGEON_OPEN_T",
        "C":    "DUNGEON_DOOR_R",
        "D":    "DUNGEON_OPEN_R",
        "E":    "DUNGEON_DOOR_B",
        "F":    "DUNGEON_OPEN_B",
        "G":    "DUNGEON_DOOR_L",
        "H":    "DUNGEON_OPEN_L",
        
        "L":    "LAVA",
        "Y":    { "class": "PortalTile", "options": { "zone": "zones:2", "dropAt": [ 9, 6 ],  "image": "sprites.png:4,0" } },
        "9":    { "class": "PortalTile", "options": { "zone": "zones:0", "dropAt": [ 18, 9 ], "image": "sprites.png:5,1" } }
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
                    "008A20811Y11208A200",
                    "007 307     307 300",
                    "007 ^1$     ^1$ 300",
                    "007             300",
                    "0065@         *5400",
                    "00007    T    30000",
                    "0000655559555540000",
                    "0000000000000000000"
                ]

}