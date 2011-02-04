{
    "zoneId":       "zones:0",
    "dimensions":   [ 30, 20 ],
    "background":   "background_island.png",
    "music":        "/media/music/seiomaccorgo.mp3",
    
    "tiles": {
        "X":    "SPAWN",
        "_":    "BASE_EMPTY",
        ".":    "BASE_STONE",
        "*":    "EMPTY_WALL",
        "A":    "DUNGEON_TOWER_1_1",
        "B":    "DUNGEON_TOWER_1_2",
        "C":    "DUNGEON_TOWER_1_3",
        "D":    "DUNGEON_TOWER_2_1",
        "E":    "DUNGEON_TOWER_2_2",
        "F":    "DUNGEON_TOWER_2_3",
        "G":    "DUNGEON_TOWER_3_1",
        "H":    "DUNGEON_TOWER_3_2",
        "I":    "DUNGEON_TOWER_3_3",
        "J":    "DUNGEON_TOWER_4_1",
        "K":    { "class": "PortalTile", "options": { "zone": "zones:1", "image": "sprites.png:1,5" } },
        "L":    "DUNGEON_TOWER_4_3",
        "1":    "TREE_1",
        "2":    "TREE_2",
        "3":    "TREE_3",
        "4":    "TREE_4",
        "Z":    "ROCK",
        "o":    { "class": "PortalTile", "options": { "zone": "zones:4", "image": "sprites.png:3,5", "dropAt": [ 1, 1 ] } },
        "W":    "WATER",
        
        "N":    "FUZZY_1",
        "O":    "FUZZY_2",
        "P":    "FUZZY_3",
        "Q":    "FUZZY_4",
        "R":    "FUZZY_5",
        "S":    "FUZZY_6",
        
        "V":    "TREASURE"
    },
    
    "baseMap":  [   
                    "______________________________",
                    "______________________________",
                    "______________________________",
                    "______________________________",
                    "______________________________",
                    "______________________________",
                    "______________________________",
                    "______________________________",
                    "______________________________",
                    "______________________________",
                    "______________________________",
                    "______________________________",
                    "______________________________",
                    "______________________________",
                    "______________________________",
                    "______________________________",
                    "______________________________",
                    "______________________________",
                    "______________________________",
                    "______________________________"
                ],
    
    "objectMap": [  
                    "******************************",
                    "******************************",
                    "******************************",
                    "******************************",
                    "******************************",
                    "************ * **ABC  ***  ***",
                    "***********      DEF        **",
                    "** o*******   NQ GHI   Z    **",
                    "** ******     OR JKL        **",
                    "**            PS            **",
                    "**                          **",
                    "**                          **",
                    "**          Z           12  **",
                    "**   V                  34  **",
                    "**                 X        **",
                    "**                          **",
                    "**                          **",
                    "******************* **********",
                    "******************* **********",
                    "******************* **********"
                ]
}