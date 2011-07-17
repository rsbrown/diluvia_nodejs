{
    "zoneId":       "zones:999",
    "dimensions":   [ 19, 9 ],
    "background":   "background_nexus.png",
    "music":        "/media/music/go_from_my_window.mp3",
    
    "tiles": {
		".":    "BASE_GRASS",
        "X":    "SPAWN",
        "Y":    { "class": "PortalTile", "options": { "zone": "zones:2", "image": "sprites.png:4,0", "dropAt": [ 9, 6 ] } },
        "9":    { "class": "PortalTile", "options": { "zone": "zones:0", "image": "sprites.png:8,1", "dropAt": [ 18, 9 ] } }
    },
    
    "LAYER_0":  [   
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
                     
     "LAYER_1": [  
                    "                   ",
                    "                   ",
                    "                   ",
                    "                   ",
                    "                   ",
                    "         X         ",
                    "                   ",
                    "                   ",
                    "                   "
                ]

}