var Defs        = require("defs"),
    Zone        = require("zone"),
    Tile        = require("tile"),
    SpawnTile   = require("spawn_tile");

var World = module.exports = function() {
    this._accounts = [];
};


var defaultZone = new Zone(64, 64),
    defaultTile = new Tile({
        image: Defs.Images.baseTile
    }),
    spawnTile   = new SpawnTile();
    

var dungeonTiles = {
	'top': 			new Tile({ image: Defs.Images.dungeonTWallTile }),
	'topright': 	new Tile({ image: Defs.Images.dungeonTRWallTile }),
	'right':		new Tile({ image: Defs.Images.dungeonRWallTile }),
	'btmright': 	new Tile({ image: Defs.Images.dungeonBRWallTile }),
	'btm': 			new Tile({ image: Defs.Images.dungeonBWallTile }),
	'btmleft':		new Tile({ image: Defs.Images.dungeonBLWallTile }),
	'left': 		new Tile({ image: Defs.Images.dungeonLWallTile }),
	'topleft': 		new Tile({ image: Defs.Images.dungeonTLWallTile })
};



var defaultTileIdx     = defaultZone.addTile(defaultTile);
var spawnTileIdx       = defaultZone.addTile(spawnTile);


for (var i = 0; i < (64 * 64); i++) {
    defaultZone.setLayerTile(0, i, defaultTileIdx);
}

defaultZone.setLayerTile(1, 64, spawnTileIdx);

World.prototype = {
    addAccount: function(account) {
        this._accounts.push(account);
        
        account.setCurrentZone(defaultZone);
        defaultZone.addAccount(account);
    },
    
    removeAccount: function(account) {
        
    },
    
    tick: function() {
        return this._ticks + 1;
    },
    
    getTicks: function() {
        return this._ticks;
    },
};