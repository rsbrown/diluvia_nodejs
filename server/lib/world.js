var Zone    = require("zone"),
    Tile    = require("tile");

var World = module.exports = function() {
    this._accounts = [];
};

var defaultZone = new Zone(64, 64),
    defaultTile = new Tile({
        image: "sprites.png:0,0"
    });

var defaultTileIdx = defaultZone.addTile(defaultTile);

for (var i = 0; i < (64 * 64); i++) {
    defaultZone.setLayerTile(0, i, defaultTileIdx);
}

World.prototype = {
    addAccount: function(account) {
        this._accounts.push(account);
        
        defaultZone.addAccount(account);
        account.setCurrentZone(defaultZone);
    },
    
    removeAccount: function(account) {
        
    }
};