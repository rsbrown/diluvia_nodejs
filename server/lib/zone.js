var Defs            = require("defs"),
    Tile            = require("tile");
    ActorTile       = require("actor_tile"),
    SpawnTile       = require("spawn_tile");

var LAYER_COUNT     = 3,
    BASE_LAYER      = 0,
    OBJECT_LAYER    = 1,
    ACTOR_LAYER     = 2;

var ACTOR_DIRECTIONAL_KEYS = {
    "n":  "PLAYER_N",
    "s":  "PLAYER_S",
    "e":  "PLAYER_E",
    "w":  "PLAYER_W" 
};
    
var Zone = module.exports = function(width, height) {
    var self = this;
    
    this._layers            = [];
    this._tiles             = {};
    this._dimensions        = [width, height, LAYER_COUNT];
    this._cmdInterval       = setInterval(function() { self._onCommandInterval(); }, Defs.COMMAND_INTERVAL);
    this._active            = [];
    this._shouldBeInactive  = [];
    this._updatedAt         = new Date().getTime();
    this._accountTile       = {};
    this._accounts          = [];
    this._updatedTiles      = [];
    
    // initialize layers
    for (var i = 0; i < LAYER_COUNT; i++) {
        this._layers[i] = {};
    }
    
    for (var key in Defs.Tiles) {
        this._tiles[key] = Defs.Tiles[key];
    }
};

Zone.prototype = {
    getDimensions: function() {
        return this._dimensions;
    },
    
    getDefaultSpawnPointIndex: function() {
        var layer       = this._layers[OBJECT_LAYER],
            spawnTiles  = [];
        
        for (var key in this._tiles) {
            var tile = this._tiles[key];
            
            if (tile.spawnTile) {
                spawnTiles.push(key);
            }
        }
        
        if (spawnTiles.length > 0) {            
            for (var key in layer) {
                if (spawnTiles.indexOf(layer[key]) != -1) {
                    return key;
                }
            }
        }

        return 0;
    },
    
    getAccountLayerTileIndex: function(account) {
        return this._accountTile[account.getUid()];
    },
    
    addAccount: function(account, coords) {
        var layerIdx    = (coords ? this.xyToIndex.apply(this, coords) : this.getDefaultSpawnPointIndex()),
            tileIdx     = "PLAYER",
            cli         = account.getClient();
    
        this._accountTile[account.getUid()] = layerIdx;
        this._accounts.push(account);
        
        this.setLayerTile(ACTOR_LAYER, layerIdx, tileIdx);

        cli.sendZoneData(this);
        cli.sendZoneState(this);

        this._resendTiles([layerIdx]);
        
        return tileIdx;
    },
    
    removeAccount: function(account) {
        var layerIdx = this._accountTile[account.getUid()];
        
        delete this._accountTile[account.getUid()];
        this._accounts.splice(this._accounts.indexOf(account), 1);
        
        this.setLayerTile(ACTOR_LAYER, layerIdx, null);
        
        this._resendAll();
    },
    
    setLayerTile: function(layer, layerIdx, tileIdx) {
        var layer = this._layers[layer];

        if (tileIdx == null) {
            delete layer[layerIdx]
        }
        else {
            layer[layerIdx] = tileIdx;
        }

        return layer;
    },
    
    getLayerTile: function(layer, layerIdx) {
        return this._layers[layer][layerIdx];
    },
    
    getLayers: function() {
        return this._layers;
    },
    
    setLayers: function(layers) {
        this._layers = layers;
    },
    
    getTiles: function() {
        return this._tiles;
    },
    
    addTile: function(tile) {
        var idx = Object.keys(this._tiles).length;
        this._tiles[idx] = tile;
        return idx;
    },
    
    getTile: function(idx) {
        return this._tiles[idx];
    },
    
    getActiveCommandIdx: function(account, command) {
        var idx = -1;
        
        for (var i = 0, len = this._active.length; i < len; i++) {
            var obj = this._active[i];
                     
            if (obj[0] == account && obj[1] == command) {
                idx = i;
            }
        }
        
        return idx;
    },
    
    startCommand: function(account, command) {        
        if (this.getActiveCommandIdx(account, command) == -1) {
            this._active.push([account, command]);
        }
    },
    
    stopCommand: function(account, command) {
        // we queue up the stop so at least one command gets executed
        if (this.getActiveCommandIdx(account, command) != -1) {
            this._shouldBeInactive.push([account, command]);
        }
    },
    
    _onCommandInterval: function() {
        var idx;
        
        // actually execute commands for active ones
        for (var i = 0, len = this._active.length; i < len; i++) {
            var obj     = this._active[i],
                account = obj[0],
                command = obj[1];
            
            this.executeCommand(account, command);
        }
        
        // process the stopCommand queue
        for (var i = 0, len = this._shouldBeInactive.length; i < len; i++) {            
            var item    = this._shouldBeInactive[i],
                idx     = this.getActiveCommandIdx(item[0], item[1]);
                        
            if (idx != -1) {
                this._active.splice(idx, 1);
            }
        }
        
        this._resendTiles(this._updatedTiles);
        
        this._updatedTiles      = [];
        this._shouldBeInactive  = [];
    },
    
    runCommand: function(account, command) {
        this.executeCommand(account, command);
        this._resendTiles(this._updatedTiles);
        this._updatedTiles = [];
    },
    
    executeCommand: function(account, command) {
        var dir;
        
        if (command == "n" || command == "s" || command == "e" || command == "w") {
            dir = command;
        }
        
        if (dir) {
            this.move(account, dir);
        }
    },
    
    move: function(account, dir) {
        var layerTileIdx    = this.getAccountLayerTileIndex(account),
            tileIdx         = this.getLayerTile(ACTOR_LAYER, layerTileIdx),
            tile            = this.getTile(tileIdx),
            dirTileIdx      = ACTOR_DIRECTIONAL_KEYS[dir],
            noisy           = true;
            
        var potentialIdx = this.indexForDirectionalMove(layerTileIdx, dir);

        // change the tile for the player to the directional
        if (tileIdx != dirTileIdx) {
            this.setLayerTile(ACTOR_LAYER, layerTileIdx, dirTileIdx);
            this._updatedTiles.push(layerTileIdx);
            tileIdx = dirTileIdx;
        }
        
        if (potentialIdx != -1) {
            var canMove = true;
            
            // it's within the zone
            for (var i = 0; i < LAYER_COUNT; i++) {
                var otherTileIdx = this._layers[i][potentialIdx],
                    tile         = this.getTile(otherTileIdx);

                if (tile) {
                    var moveRet = tile.moveInto(account);
                    
                    if (moveRet == "silent") {
                        noisy = false;
                    }
                    
                    if (!moveRet || moveRet == "silent") {
                        // FAIL MOVEMENT
                        canMove = false;
                        break;
                    }
                }
            }

            if (canMove) {
                this.setLayerTile(ACTOR_LAYER, layerTileIdx, null);
                this.setLayerTile(ACTOR_LAYER, potentialIdx, tileIdx);

                this._accountTile[account.getUid()] = potentialIdx;

                this._updatedTiles.push(layerTileIdx);
                this._updatedTiles.push(potentialIdx);

                console.log("MOVE " + account.getUid() + ": " + layerTileIdx + " => " + potentialIdx + " (" + tileIdx + ")");
            } else {
                console.log("User tried to move out of map");
                if (noisy) account.getClient().sendMoveFailed();
            }
            
        }
        else {
            console.log("User tried to move out of map");
            if (noisy) account.getClient().sendMoveFailed();
        }
    },
    
    _resendTiles: function(updatedTiles) {        
        if (updatedTiles.length > 0) {
            var layerState = {};

            for (var li = 0; li < this._dimensions[2]; li++) {
                var data = {};
                
                for (var i = 0, len = updatedTiles.length; i < len; i++) {
                    var updatedTile = updatedTiles[i];
                    data[updatedTile] = this.getLayerTile(li, updatedTile);
                }
                
                console.log("RESEND: " + li + " = " + JSON.stringify(data));
                layerState[li] = data;
            }
            
            for (var i = 0, len = this._accounts.length; i < len; i++) {
                var account = this._accounts[i];
                account.getClient().sendZoneState(this, layerState);
            }
        }
    },
    
    indexToXy: function(idx) {
        var y = Math.floor(idx / this._dimensions[0]),
            x = idx % this._dimensions[0];
                
        return [x, y];
    },
    
    xyToIndex: function(x, y) {
        if (!(x < 0 || y < 0 || x >= this._dimensions[0] || y >= this._dimensions[1])) {
            return (y * this._dimensions[0]) + x;
        }
        else {
            return -1;
        }
    },
    
    indexForDirectionalMove: function(idx, direction) {
        var xy = this.indexToXy(idx);
        
        if (direction == "n") {
            xy[1] -= 1;
        }
        else if (direction == "s") {
            xy[1] += 1;
        }
        else if (direction == "e") {
            xy[0] += 1;
        }
        else if (direction == "w") {
            xy[0] -= 1;
        }
        
        return this.xyToIndex(xy[0], xy[1]);
    },
    
    hasUpdatedSince: function(date) {
        return (this._updatedAt > date);
    },
    
    _resendAll: function() {
        for (var i = 0, len = this._accounts.length; i < len; i++) {
            var account = this._accounts[i],
                client  = account.getClient();
            
            client.sendZoneData(this);
            client.sendZoneState(this);
        }
    },
    
    getBackground: function() {
        return this._background;
    },
    
    setBackground: function(bg) {
        this._background = bg;
    },
    
    getMusic: function() {
        return this._music;
    },
    
    setMusic: function(music) {
        this._music = music;
    }
};