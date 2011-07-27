var _            = require("underscore"),
    fs           = require("fs"),
    events       = require("events"),
    Persistence  = require("persistence"),
    Defs         = require("defs"),
    World        = require("world"),
    Tile         = require("tile"),
    SpawnTile    = require("spawn_tile"),
    PortalTile   = require("portal_tile"),
    WallTile     = require("wall_tile"),
    PainTile     = require("pain_tile"),
    GoalTile     = require("goal_tile"),
    Board        = require("board"),
    BoardLayer   = require("board_layer");

var Zone = module.exports = function(options) {
    events.EventEmitter.call(this);
    var self = this;
    options                 = options || {};
    this._id                = options["id"];
    this._accountId         = options["account_id"];
    this._name              = options["name"];
    this._world             = null;
    this._board             = new Board();
    this._tiles             = {};
    this._dimensions        = [options.width, options.height, Defs.LAYER_COUNT];
    this._active            = [];
    this._shouldBeInactive  = [];
    this._actors            = [];
    this._background        = options["background"];
    this._music             = options["music"];
    this._tileUid           = (new Date()).getTime();
    this._config            = options["config"];
    
    for (key in Defs.Tiles) {
      var tile = this._tiles[key] = Tile.instanceFromDefinition(Defs.Tiles[key]);
      tile.setZone(this);
    }
    
    this.loadConfig();
};

Zone.MAP_LAYER_KEYS    = [ "LAYER_0", "LAYER_1" ];

Zone.findAllForAccount = function(account, callback) {
    var redis = Persistence.getRedis();
    var zoneList = [];
    redis.keys("zone:*", function (err, keys) {
        redis.mget(keys, function (err, zones) {
            if (zones) {
                zones.forEach(function (data, index) {
                    var z = JSON.parse(data);
                    if (z.account_id === account.getId() ) {
                      zoneList[index] = z;
                    }
                });
            }
            callback(zoneList);
        });
    });
};

Zone.findAll = function(callback) {
    var redis = Persistence.getRedis();
    var zoneList = [];
    redis.keys("zone:*", function (err, keys) {
        redis.mget(keys, function (err, zones) {
            if (zones) {
                zones.forEach(function (data, index) {
                    var z = JSON.parse(data);
                    zoneList[index] = z;
                });
            }
            callback(zoneList);
        });
    });
};

Zone.findById = function(id, callback) {
    var redis = Persistence.getRedis();
    redis.get("zone:" + id, function(err, data) {
        var zone = null;
        if (data) {
            var conf = JSON.parse(data);
            zone = new Zone(conf);
        }
        callback(zone);
    });
};

Zone.createNewZone = function(account, callback) {
    var redis = Persistence.getRedis();
    redis.incr( 'pkid' , function( err, newZoneId ) {
        fs.readFile("zones/dungeon_01.js", function(err, data) {
            var conf = JSON.parse(data);
            var zone = new Zone({
              id:           newZoneId, 
              name:         "New Zone",
              music:        "dungeon_music",
              account_id:   account.getId(), 
              width:        conf.dimensions[0] || 64, 
              height:       conf.dimensions[1] || 64,
              config:       conf
            });
            zone.save(function(){
                account.setEditorZoneId(newZoneId);
                account.save(function() {callback(zone)});
            });
        });
    });
};

Zone.createNewIsland = function(account, callback) {
    var redis = Persistence.getRedis();
    redis.incr( 'pkid' , function( err, newZoneId ) {
        fs.readFile("zones/default_island.js", function(err, data) {
            var conf = JSON.parse(data);
            var zone = new Zone({
              id:           newZoneId, 
              name:         "My Island", 
              music:        "seiomaccorgo",
              background:   "island1.png",
              account_id:   account.getId(), 
              width:        conf.dimensions[0] || 64,
              height:       conf.dimensions[1] || 64,
              config:       conf
            });
            zone.save(function(){
                account.setIslandZoneId(newZoneId);
                account.setEditorZoneId(newZoneId);
                account.save(function() {callback(zone)});
            });
        });
    });
};

_.extend(Zone.prototype, events.EventEmitter.prototype, {
    save: function(callback){
        if (callback === undefined ) { callback = function(){}; }
        Persistence.getRedis().set('zone:'+this._id, this.serialize(), callback);
    },
    
    serialize: function() {
        return JSON.stringify({
            "id"         : this._id,
            "name"       : this.getName(),
            "account_id" : this.getAccountId(),
            "background" : this.getBackground(),
            "music"      : this.getMusic(),
            "width"      : this._dimensions[0],
            "height"     : this._dimensions[1],
            // "config"     : this.serializeConfig()
            "config"     : this.getConfig()
        });
    },
    
    setConfig: function(conf) {
        this._config = conf;
    },
    
    getConfig: function() {
      return this._config;
    },
    
    reloadConfig: function() {
      delete this._board;
      this._board = new Board();
      this.loadConfig();
    },
    
    loadConfig: function() {
      for (var mli = 0, mllen = Zone.MAP_LAYER_KEYS.length; mli < mllen; mli++) {
          var confMapLayer    = this._config[Zone.MAP_LAYER_KEYS[mli]],
              board           = this.getBoard(),
              layer           = board.getLayer(mli);
          
          var zoneSize = this._dimensions[0]*this._dimensions[1];
          for (var idx = 0; idx < zoneSize; idx++) {
            var tileId = 0;
            var tileInfo = confMapLayer[idx];
            if (tileInfo) {
                if (isNaN(tileInfo)) {
                  var klass   = eval(tileInfo.class),
                      tile    = new klass(tileInfo.options);
                  tileId = this.addTile(tile, tileInfo.class);
                }
                else {
                  tileId  = tileInfo;
                }
            }
            layer.pushTile(idx, tileId);
          }
      }
    },
    
    resetConfig: function(zoneData, liveZone) {
      var updatedConfig = {};
      updatedConfig.background = this.getBackground();
      updatedConfig.music = this.getMusic();
      for (i in Zone.MAP_LAYER_KEYS) {
        var layerLabel = Zone.MAP_LAYER_KEYS[i];
        updatedConfig[layerLabel] = [];
        for (j in zoneData.layers[i]) {
          var tile = zoneData.layers[i][j];
          if (tile) {
            var tileId = zoneData.layers[i][j][0];
            if (isNaN(tileId)) {
              var tileDef = liveZone.getTile(tileId);
              updatedConfig[layerLabel][j] = tileDef.serializable();
            } else {
              updatedConfig[layerLabel][j] = parseInt(tileId);
            }
          } else {
            updatedConfig[layerLabel][j] = null;
          }
        }
      }
      this.setConfig(updatedConfig);
      this.reloadConfig();
    },
    
    _old_serializeConfig: function(callback) {
      var zone    = this,
          config  = { "background":   this._background,
                      "music":        this._music };
          
      for (var layerIdx=0; layerIdx < Zone.MAP_LAYER_KEYS.length; layerIdx++) {
        var layer = this._board.getLayer(layerIdx);
        var layerKey = "LAYER_" + layerIdx;
        var zoneSize = (this._dimensions[0]*this._dimensions[1]);
        config[layerKey] = new Array(zoneSize);
        for (idx in layer.getRenderAttributes()) {
          var tileList = layer.getRenderAttributes()[idx];
          for (tile in tileList) {
            var tileId = tileList[tile][0];
            if (typeof tileId === "number") {
              config[layerKey][idx] = tileId;
            } else {
              var tileDef = this._tiles[tileId];
              config[layerKey][idx] = tileDef.serializable();
            }
          }
        }
      }
      
      return config;
    },

    getNextTileId: function() {
      return this._tileUid++;
    },

    setId: function(id) {
      this._id = id;
    },

    getId: function() {
      return this._id;
    },
    
    getName: function() {
      return this._name;
    },
    
    setName: function(name) {
      this._name = name;
    },
    
    getAccountId: function() {
        return this._accountId;
    },
    
    getZoneId: function() {
        return this._zoneId;
    },
    
    getDimensions: function() {
        return this._dimensions;
    },
    
    getWidth: function() {
        return this._dimensions[0];
    },
    
    getHeight: function() {
        return this._dimensions[1];
    },

    setDimensions: function(width, height) {
      this._dimensions = [width, height, Defs.LAYER_COUNT];
    },
    
    getCenterTileIndex: function() {
      var x = Math.floor(this.getDimensions()[0]/2);
      var y = Math.floor(this.getDimensions()[1]/2);
      return this.xyToIndex(x, y);
    },
    
    getDefaultSpawnPointIndex: function() {
        var spawnTiles  = [],
            resIndex    = -1;
        
        for (var key in this._tiles) {
            var tile = this._tiles[key];
            if (tile.spawnTile) {
                spawnTiles.push(Number(key));
            }
        }
        
        if (spawnTiles.length > 0) {
            var layer = this._board.getLayer(Defs.OBJECT_LAYER);
            
            layer.eachTile(function(tileIndex, tileStack) {
                _(tileStack).each(function(tileData) {
                    // var tileId = tileData[0];
                    var tileId = tileData;
                    if (spawnTiles.indexOf(tileId) != -1 && resIndex == -1) {
                        resIndex = tileIndex;
                    }                    
                });
            });
        }
        
        if(resIndex == -1) {resIndex = 0;}
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
                        var tile = zone.getTile(_tileData);

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
                var tile = zone.getTile(tileData);
                return tile ? tile.canMoveInto(actor, tileIndex, tileData, board.getLayerIndexFor(layer)) : true;
            });
        });
    },
    
    centerEditor: function(account, index) {
      if (index != -1) {
        account.setEditorViewTileIndex(index);
      }
    },

    move: function(actor, direction) {
        if (actor.setOrientation) {
            actor.setOrientation(direction);
        }

        var prevTileIndex  = actor.getTileIndex(),
            nextTileIndex  = this.indexForDirectionalMove(prevTileIndex, direction);
                
        if (nextTileIndex == -1) {
            actor.moveFailed();
        }
        else if (this.isTileIndexPassableBy(nextTileIndex, actor)) {
            var world          = this._world,
                layer          = this._board.getLayer(Defs.ACTOR_LAYER),
                actorTiles     = layer.getTiles(prevTileIndex),
                tileData       = actor.getTileDataFrom(actorTiles);
            
            layer.popTile(prevTileIndex, tileData);
            layer.pushTile(nextTileIndex, tileData);
            
            this.tileAtIndex(prevTileIndex, function(tile, _tileData, layerIndex){
                tile.moveOut(actor, prevTileIndex, _tileData, layerIndex, world);
            });
            
            actor.setTileIndex(nextTileIndex);
            
            this.tileAtIndex(nextTileIndex, function(tile, _tileData, layerIndex){
                tile.moveInto(actor, nextTileIndex, _tileData, layerIndex, world);
            });
            
        }
        else {
            this.tileAtIndex(nextTileIndex, function(tile){
              if(tile.isImpassable()) {
                tile.bumpInto(actor);
              }
            });
        }
    },
    
    portalAtIndex: function(tileIndex, callback) {
      var zone         = this,
          returnVal    = null,
          tileData     = null,
          tilesAtIndex = this._board.getAllTilesFor(tileIndex);
      _(tilesAtIndex).each(function(tilesAndLayer) {
          var tiles       = tilesAndLayer[0],
              layerIndex  = tilesAndLayer[1];

          _(tiles).each(function(_tileData) {
              var tile = zone.getTile(_tileData);
              if (tile && (layerIndex === Defs.OBJECT_LAYER) && tile.portalTile) {
                  returnVal = tile;
                  tileData  = _tileData;
              }
          });
      });
      callback(returnVal, tileData);
    },
    
    tileAtIndex: function(tileIndex, callback) {
        var zone         = this,
            tilesAtIndex = this._board.getAllTilesFor(tileIndex);
        _(tilesAtIndex).each(function(tilesAndLayer) {
            var tiles       = tilesAndLayer[0],
                layerIndex  = tilesAndLayer[1];
            
            _(tiles).each(function(_tileData) {
                var tile = zone.getTile(_tileData);
                if (tile) {
                    callback(tile, _tileData, layerIndex);
                }
            })
        });
    },
    
    getTiles: function() {
        return this._tiles;
    },
    
    addTile: function(tile, class) {
        var idx = class + "_" + this.getNextTileId();
        this._tiles[idx] = tile;
        tile.setZone(this);
        return idx;
    },
    
    getTile: function(idx) {
        if (typeof idx === "object") {
          idx = idx[0];
        }
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
        this.emit("chat", user + "> " + text);
    },
    
    command: function(actor, command) {
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
            tileData    = player.getTileDataFrom(tiles),
            orienMap    = {
              "N": 1,
              "S": 2,
              "E": 3,
              "W": 4
            };
        
        if (tileData) {
            layer.popTile(tileIndex, tileData);
            layer.pushTile(tileIndex, [ orienMap[orientation.toUpperCase()], tileData[1] ]);
        }
    },
    
    getRenderAttributes: function() {
        var tiles       = this._tiles,
            tileData    = {};
        
        for (var key in tiles) {
            tileData[key] = tiles[key].getRenderAttributes();
        }
        return {
            "id":           this.getId(),
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
    },
    
    setWorld: function(world) {
        this._world = world;
    },
    
    getWorld: function() {
        return this._world;
    }
});
