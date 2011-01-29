var Defs            = require("defs"),
    ActorTile       = require("actor_tile");

var LAYER_COUNT     = 3,
    BASE_LAYER      = 0,
    OBJECT_LAYER    = 1,
    ACTOR_LAYER     = 2;
    
var Zone = module.exports = function(width, height) {
    var self = this;
    
    this._layers        = [];
    this._tiles         = [];
    this._dimensions    = [width, height];
    this._cmdInterval   = setInterval(function() { self._onCommandInterval(); }, Defs.COMMAND_INTERVAL);
    this._active        = [];
    this._updatedAt     = new Date().getTime();
    this._accountTile   = {};
    
    // initialize layers
    for (var i = 0; i < LAYER_COUNT; i++) {
        this._layers[i] = {};
    }
};

Zone.prototype = {
    getSpawnPointIndex: function() {
        var layer = this._layers[OBJECT_LAYER],
            spawnTiles = [];
        
        for (var i = 0, len = this._tiles.length; i < len; i++) {
            var tile = this._tiles[i];
            
            if (tile.spawnPoint) {
                spawnTiles.push(i);
            }
        }
        
        if (spawnTiles.length > 0) {            
            for (var i = 0, len = layer.length; i < len; i++) {            
                if (spawnTiles.indexOf(layer[i]) != -1) {
                    return i;
                }
            }
        }
        else {
            return 0;
        }
    },
    
    getAccountLayerTileIndex: function(account) {
        return this._accountTile[account.getUid()];
        
        // var tileIdx;
        //       
        //       for (var i = 0, len = this._tiles.length; i < len; i++) {
        //           var tile = this._tiles[i];
        //           
        //           if (tile.account == account) {
        //               tileIdx = i;
        //           }
        //       }
        //       
        //       console.log(tileIdx);
        //       
        //       if (tileIdx) {
        //           var actorLayer = this._layers[ACTOR_LAYER];
        //           console.log(actorLayer);
        //           
        //           for (var key in actorLayer) {
        //               var val = actorLayer[key];
        //               
        //               if (val == tileIdx) {
        //                   return key;
        //               }
        //           }
        //       }
    },
    
    addAccount: function(account) {
        var tile        = new ActorTile(account),
            layerIdx    = this.getSpawnPointIndex(),
            tileIdx     = this.addTile(tile),
            cli         = account.getClient();
        
        this._accountTile[account.getUid()] = layerIdx;
        
        this.setLayerTile(ACTOR_LAYER, layerIdx, tileIdx);
        
        cli.sendZoneData(this);
        cli.sendZoneState(this);
        
        return tile;
    },
    
    setLayerTile: function(layer, layerIdx, tileIdx) {
        var layer = this._layers[layer];

        if (tileIdx == null) {
            delete layer[layerIdx]
        }
        else {
            layer[layerIdx] = tileIdx;
        }

        this._updatedAt = new Date().getTime();

        return layer;
    },
    
    getLayerTile: function(layer, layerIdx) {
        return this._layers[layer][layerIdx];
    },
    
    getLayers: function() {
        return this._layers;
    },
    
    getTiles: function() {
        return this._tiles;
    },
    
    addTile: function(tile) {
        var idx = this._tiles.length;
        this._tiles.push(tile);
        return idx;
    },
    
    getTile: function(idx) {
        return this._tiles[idx];
    },
    
    startCommand: function(account, command) {
        console.log("Adding " + account.getUid() + " with " + command);
        
        this._active.push([account, command]);
    },
    
    stopCommand: function(account, command) {
        var idx;
        
        for (var i = 0, len = this._active.length; i < len; i++) {
            var obj         = this._active[i],
                _account    = obj[0],
                _command    = obj[1];
                        
            if (account == _account && command == _command) {
                idx = i;
            }
        }
                
        if (idx != -1) {
            this._active.splice(idx, 1);
        }        
    },
    
    _onCommandInterval: function() {
        for (var i = 0, len = this._active.length; i < len; i++) {
            var obj     = this._active[i],
                account = obj[0],
                command = obj[1];
            
            this.executeCommand(account, command);
        }
    },
    
    executeCommand: function(account, command) {
        var layerTileIdx    = this.getAccountLayerTileIndex(account),
            tileIdx         = this.getLayerTile(ACTOR_LAYER, layerTileIdx),
            tile            = this.getTile(tileIdx),
            dir;
        
        if (command == "n" || command == "s" || command == "e" || command == "w") {
            dir = command;
        }
        
        if (dir) {
            var potentialIdx = this.indexForDirectionalMove(layerTileIdx, dir);
        
            if (potentialIdx != -1) {
                var canMove = true;
            
                // it's within the zone
                for (var i = 0; i < LAYER_COUNT; i++) {
                    var tileIdx = this._layers[i][potentialIdx],
                        tile    = this.getTile(tileIdx);
                
                    if (tile) {
                        if (!tile.moveInto(account)) {
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
                }
            }
            else {
                console.log("User tried to move out of map");
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
    }
};