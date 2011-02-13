var _               = require("underscore"),
    events          = require("events"),
    Persistence = require("persistence"),
    Defs            = require("defs"),
    Tile            = require("tile"),
    ActorTile       = require("actor_tile"),
    SpawnTile       = require("spawn_tile"),
    Board           = require("board"),
    BoardLayer      = require("board_layer");

var Zone = module.exports = function(world, zoneId, options) {
    events.EventEmitter.call(this);
    
    var self = this;
    
    options                 = options || {};
    
    this._world             = world;
    this._zoneId            = zoneId;
    this._board             = new Board();
    this._tiles             = {};
    this._dimensions        = [options.width, options.height, Defs.LAYER_COUNT];
    this._active            = [];
    this._shouldBeInactive  = [];
    this._actors            = [];
    this._tileUid           = (new Date()).getTime();

    // initialize layers
    for (var i = 0; i < Defs.LAYER_COUNT; i++) {
        this._board.addLayer(new BoardLayer());
    }
    
    for (var key in Defs.Tiles) {
        var tile = this._tiles[key] = Tile.instanceFromDefinition(Defs.Tiles[key]);
        tile.setZone(this);
    }
};

Zone.findById = function(id, callback) {
    var redis = Persistence.getRedis();
    redis.get("zone:" + id, function(err, data) {
        var account = null;
        if (data) {
            account = new Account(JSON.parse(data));
        }
        callback(account);
    });
};

_.extend(Zone.prototype, events.EventEmitter.prototype, {
    save: function(callback){
        if (callback === undefined ) { callback = function(){}; }
        Persistence.getRedis().set('account:'+this._id, this.serialize(), callback);
    },
    
    serialize: function() {
        var player = this.getPlayer();
        return JSON.stringify({
            "id"            : this._id,
            "musicOn"       : this._musicOn,
            "username"      : this._username,
            "zoneIdx"       : player ? player.getZoneId() : null,
            "tileIdx"       : player ? player.getTileIndex() : null,
            "orientation"   : player ? player.getOrientation() : null,
            "score"         : this._score
        });
    },

    getNextTileId: function() {
        return this._tileUid++;
    },
    
    getZoneId: function() {
        return this._zoneId;
    },
    
    getDimensions: function() {
        return this._dimensions;
    },
    
    getDefaultSpawnPointIndex: function() {
        var spawnTiles  = [],
            resIndex    = -1;
        
        for (var key in this._tiles) {
            var tile = this._tiles[key];
            
            if (tile.spawnTile) {
                spawnTiles.push(key);
            }
        }
        
        if (spawnTiles.length > 0) {
            var layer = this._board.getLayer(Defs.OBJECT_LAYER);
            
            layer.eachTile(function(tileIndex, tileStack) {
                _(tileStack).each(function(tileData) {
                    var tileId = tileData[0];
                    
                    if (spawnTiles.indexOf(tileId) != -1 && resIndex == -1) {
                        resIndex = tileIndex;
                    }                    
                });
            });
        }

        return resIndex;
    },
    
    getBoard: function() {
        return this._board;
    },
    
    addActor: function(actor, tileId, tileIndex) {
        actor.setZoneId(this._zoneId);
        actor.setTileIndex(tileIndex);
        
        this._actors.push(actor);
        this._board.getLayer(Defs.ACTOR_LAYER).pushTile(tileIndex, [ tileId, { actorId: actor.getActorId() } ]);
        
        this.playSound("portal");
        
        actor.land();
    },
    
    removeActor: function(actor) {
        var self            = this,
            zone            = this,
            idx             = this._actors.indexOf(actor),
            tileIndex       = actor.getTileIndex(),
            world           = this._world;
                
        if (idx != -1) {
            var actorLayer  = this._board.getLayer(Defs.ACTOR_LAYER),
                tiles       = actorLayer.getTiles(tileIndex),
                tileData    = actor.getTileDataFrom(tiles);
            
            if (tileData) {
                actor.setZoneId(null);

                this._board.getLayer(Defs.ACTOR_LAYER).popTile(tileIndex, tileData);
                this._actors.splice(idx, 1);
            
                // send moveOut notifications to tiles
                _(this._board.getAllTilesFor(tileIndex)).each(function(tilesAndLayer) {
                    var tiles       = tilesAndLayer[0],
                        layerIndex  = tilesAndLayer[1];

                    _(tiles).each(function(_tileData) {
                        var tile = zone.getTile(_tileData[0]);                    

                        if (tile) {
                            tile.moveOut(actor, tileIndex, _tileData, layerIndex, world);
                        }
                    })
                });
                
                actor.setTileIndex(null);
            }
        }
    },
    
    isTileIndexPassableBy: function(tileIndex, actor) {
        var zone    = this,
            board   = this._board;
                
        return _(board.getLayers()).all(function(layer) {
            var tiles = layer.getTiles(tileIndex);
            
            return _(layer.getTiles(tileIndex)).all(function(tileData) {
                var tile = zone.getTile(tileData[0]);
                return tile ? tile.canMoveInto(actor, tileIndex, tileData, board.getLayerIndexFor(layer)) : true;
            });
        });
    },
    
    move: function(actor, direction) {
        if (actor.setOrientation) {
            actor.setOrientation(direction);
        }
        
        var world           = this._world,
            zone            = this,
            layer           = this._board.getLayer(Defs.ACTOR_LAYER),
            prevTileIndex   = actor.getTileIndex(),
            nextTileIndex   = this.indexForDirectionalMove(prevTileIndex, direction),
            prevTiles       = this._board.getAllTilesFor(prevTileIndex),
            nextTiles       = this._board.getAllTilesFor(nextTileIndex);
                
        if (nextTileIndex != -1 && this.isTileIndexPassableBy(nextTileIndex, actor)) {            
            var actorTiles  = layer.getTiles(prevTileIndex),
                tileData    = actor.getTileDataFrom(actorTiles);
            
            layer.popTile(prevTileIndex, tileData);
            layer.pushTile(nextTileIndex, tileData);

            _(prevTiles).each(function(tilesAndLayer) {
                var tiles       = tilesAndLayer[0],
                    layerIndex  = tilesAndLayer[1];
                
                _(tiles).each(function(_tileData) {
                    var tile = zone.getTile(_tileData[0]);                    
                    
                    if (tile) {
                        tile.moveOut(actor, prevTileIndex, _tileData, layerIndex, world);
                    }
                })
            });

            actor.setTileIndex(nextTileIndex);

            _(nextTiles).each(function(tilesAndLayer) {
                var tiles       = tilesAndLayer[0],
                    layerIndex  = tilesAndLayer[1];
                
                _(tiles).each(function(_tileData) {
                    var tile = zone.getTile(_tileData[0]);                    
                    
                    if (tile) {
                        tile.moveInto(actor, nextTileIndex, _tileData, layerIndex, world);
                    }
                })
            });
        }
        else {
            actor.moveFailed();
        }
    },
    
    getTiles: function() {
        return this._tiles;
    },
    
    addTile: function(tile) {
        var idx = this.getNextTileId();
        this._tiles[idx] = tile;
        tile.setZone(this);
        return idx;
    },
    
    getTile: function(idx) {
        return this._tiles[idx];
    },
    
    getTileId: function(tile) {
        for (var key in this._tiles) {
            if (this._tiles[key] == tile) {
                return key;
            }
        }
    },
        
    chat: function(user, text) {
        // TODO: need to bind this
        this.emit("chat", user + "> " + text);
    },
    
    command: function(actor, command) {
        var dir;
        
        if (command == "n" || command == "s" || command == "e" || command == "w") {
            this.move(actor, command);
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
    },
    
    playSound: function(sound) {
        this.emit("sound", sound);
    },
    
    setPlayerTileForOrientation: function(player, orientation) {
        var layer       = this._board.getLayer(Defs.ACTOR_LAYER),
            tileIndex   = player.getTileIndex(),
            tiles       = layer.getTiles(tileIndex),
            tileData    = player.getTileDataFrom(tiles);
        
        if (tileData) {
            layer.popTile(tileIndex, tileData);
            layer.pushTile(tileIndex, [ "PLAYER_" + orientation.toUpperCase(), tileData[1] ]);            
        }
    },
    
    getRenderAttributes: function() {
        var tiles       = this._tiles,
            tileData    = {};
        
        for (var key in tiles) {
            tileData[key] = tiles[key].getRenderAttributes();
        }
        
        return {
            "dimensions":   this.getDimensions(),
            "background":   this.getBackground(),
            "music":        this.getMusic(),
            "tiles":        tileData
        }
    },
    
    getStateAttributes: function() {
        return this._board.getRenderAttributes();
    },
    
    getActors: function() {
        return this._actors;
    },
    
    getMaxIndex: function() {
        return this.xyToIndex(this._dimensions[0] - 1, this._dimensions[1] - 1);
    }
});
