var _           = require("underscore"),
    events      = require("events"),
    Defs        = require("defs"),
    Zone        = require("zone"),
    Tile        = require("tile"),
    SpawnTile   = require("spawn_tile"),
    PortalTile  = require("portal_tile"),
    WallTile    = require("wall_tile"),
    PainTile    = require("pain_tile"),
    GoalTile    = require("goal_tile"),
    Player      = require("player"),
    fs          = require("fs");

var QUEUE_INTERVAL = 25;

var World = module.exports = function() {
    this._accounts      = [];
    this._defaultTiles  = [];
    this._zones         = {};
    this._online        = [];
    this._stateQueue    = [];

    setInterval(_(this._onQueueInterval).bind(this), QUEUE_INTERVAL);
    
    this._loadZones();
};

World.DEFAULT_ZONE_ID   = "zones:0";
World.MAP_LAYER_KEYS    = [ "baseMap", "objectMap" ];

World.prototype = {
    setDefaultZone: function(zone) {
        this._zones[World.DEFAULT_ZONE_ID] = zone;
    },
    
    getDefaultZone: function() {
        return this._zones[World.DEFAULT_ZONE_ID];
    },
    
    setZone: function(zoneId, zone) {
        if (zone) {
            zone._zoneId        = zoneId;
            this._zones[zoneId] = zone;
            this._hookZone(zone);
        }
        else {
            delete this._zones[zoneId];
        }
    },
    
    getZone: function(zoneId) {
        return this._zones[zoneId];
    },
    
    _onQueueInterval: function() {
        var world = this;
        
        if (this._stateQueue.length > 0) {
            var zoneStates  = {};
        
            for (var i = 0, len = this._stateQueue.length; i < len; i++) {
                var item        = this._stateQueue[i],
                    zone        = item[0],
                    layerIndex  = item[1],
                    tileIndex   = item[2],
                    tiles       = item[3],
                    zoneId      = zone.getZoneId();
            
                if (!(zoneId in zoneStates)) {
                    zoneStates[zoneId] = {};
                }
            
                if (!(layerIndex in zoneStates[zoneId])) {
                    zoneStates[zoneId][layerIndex] = {};
                }
            
                zoneStates[zoneId][layerIndex][tileIndex] = tiles;
            }
        
            for (var zoneId in zoneStates) {
                var state   = zoneStates[zoneId],
                    zone    = world.getZone(zoneId);
                        
                _(this.getAccountsForZone(zone)).each(function(account) {
                    account.getClient().sendZoneState(
                        world.composeZoneStateFor(account.getPlayer(), state)
                    )
                });
            }

            this._stateQueue = [];
        }
        
        var currentTime = (new Date()).getTime();
        
        for (var i = 0, len = this._online.length; i < len; i++) {
            var account     = this._online[i],
                player      = account.getPlayer(),
                poisonedAt  = player.getPoisonedAt();
            
            if (poisonedAt) {
                if (currentTime >= (poisonedAt + Defs.POISON_DEATH_DELAY)) {
                    account.getClient().sendChat(Defs.CHAT_CRITICAL, "You were poisoned and died!");
                    world.accountDeath(account);
                }                
            }
        }
    },
    
    _hookZone: function(zone) {
        var self    = this,
            board   = zone.getBoard();
                
        zone.on("chat", function(message) {
            self._onZoneChat(zone, message);
        });
        
        zone.on("sound", function(sound) {
            self._onZoneSound(zone, sound);
        });
        
        board.on("layerTileChange", function(layerIndex, tileIndex, tiles) {
            var layers = board.getLayers();
            
            // we push all of them so client gets a full state stack to redraw the tile
            for (var i = 0, len = layers.length; i < len; i++) {
                self._stateQueue.push([zone, i, tileIndex, layers[i].getTiles(tileIndex)]);
            }
        });
    },
        
    _onZoneChat: function(zone, message) {
        _(this.getAccountsForZone(zone)).each(function(account) {
            account.getClient().sendChat(Defs.CHAT_PLAYER, message);
        });
    },
    
    _onZoneSound: function(zone, sound) {
        _(this.getAccountsForZone(zone)).each(function(account) {
            account.getClient().sendPlaySound(sound);
        });        
    },
    
    getAccountsForZone: function(zone) {
        var zoneId = zone.getZoneId();
        
        return _(this._online).select(function(account) {
            return account.getPlayer().getZoneId() == zoneId;
        });
    },

    playerInitialize: function(account, client) {
        var player  = new Player(),
            world   = this;
        
        account.setClient(client);
        account.setPlayer(player);
        
        this._online.push(account);
        
        // switch the player's tile when they change orientations
        player.on("changeOrientation", function(orientation) {
            var currentZone = world.getZone(player.getZoneId());
            currentZone.setPlayerTileForOrientation(player, orientation);
        });
        
        player.on("moveFailed", function() {
            client.sendPlaySound("bump");
        });
        
        player.on("changeRole", function(newRole) {
            if (newRole == Defs.ROLE_ASSASSIN) {
                client.sendChat(Defs.CHAT_ALERT,
                    "You are now the assassin! \
                     You may poison other players by approaching them and pressing 'a'. \
                     Don't let them find your precious treasure!"
                );
            } else {
                client.sendChat(Defs.CHAT_ALERT,
                    "You have lost your assassin abilities."
                );
            }
        });
        
        player.on("changeGoalInventory", function(goalInventory) {
            if (goalInventory != null) { 
                client.sendChat(Defs.CHAT_ALERT,
                    "You found the treasure! Press 'e' to drop it and become the assassin!"
                );
            }
        })
        
        player.on("tookDamage", function(damage, hitpoints) {
            client.sendPlaySound("ouch");
            client.sendFlash("red");
            
            if (hitpoints <= 0) {
                world.accountDeath(account);
            }
        });
        
        player.on("died", function() {
            _(world._online).each(function(otherAccount) {
                otherAccount.getClient().sendChat(Defs.CHAT_INFO,
                    account.getUid() + " died!"
                )
            });
        });
    
        client.on("disconnect", function() {
            world.accountRemove(account);
        });
        
        this.accountSpawn(account);
        
        return player;
    },
    
    accountSpawn: function(account) {
        var zone    = this.getDefaultZone(),
            player  = account.getPlayer();
            
        this.placeAccountInZone(account, zone, zone.getDefaultSpawnPointIndex());
        
        player.spawn();
    },
    
    accountRemove: function(account) {
        var player      = account.getPlayer(),
            currentZone = this.getZone(player.getZoneId()),
            idx         = this._online.indexOf(account);
        
        this.actorDropGoal(player);
        this._online.splice(idx, 1);
        
        currentZone.removeActor(player);
        
        account.setClient(null);
        account.setPlayer(null);
    },
    
    accountDeath: function(account) {
        var player  = account.getPlayer(),
            zone    = this.getZone(player.getZoneId());
        
        zone.playSound("scream");
        player.die();
        this.actorDropGoal(player);
        this.removeAccountFromZone(account, zone);
        this.accountSpawn(account);
    },
    
    placeAccountInZone: function(account, zone, tileIndex) {
        var client  = account.getClient(),
            player  = account.getPlayer();
        
        zone.addActor(player, "PLAYER", tileIndex);    
    },
    
    removeAccountFromZone: function(account, zone) {
        var client  = account.getClient(),
            player  = account.getPlayer();
        
        zone.removeActor(player);
    },
    
    composeZoneStateFor: function(actor, zoneState) {
        return {
            "playerIdx":    actor.getTileIndex(),
            "layers":       zoneState
        };
    },
    
    otherCommand: function(account, zone, command) {
        var client      = account.getClient(),
            player      = account.getPlayer(),
            tileIndex   = player.getTileIndex(),
            orientation = player.getOrientation(),
            otherIndex  = zone.indexForDirectionalMove(tileIndex, orientation),
            actors      = zone.getActors();

        if (command == "attack" && player.getRole() == Defs.ROLE_ASSASSIN) {
            var successfullyAttacked = false,
                otherActors          = [];
            
            for (var i = 0, len = actors.length; i < len; i++) {
                var actor           = actors[i],
                    actorTileIndex  = actor.getTileIndex();
            
                if (actor != player && (actorTileIndex == otherIndex || actorTileIndex == tileIndex)) {
                    otherActors.push(actor);
                }
            }
        
            _(otherActors).each(function(otherActor) {
                otherActor.becomesPoisoned();
            });
            
            if (otherActors.length > 0) {
                client.sendFlash("purple");
            }
        }
        else if (command == "drop") {
            this.actorDropGoal(player);
        }
    },

    teleport: function(actor, zoneId, coords) {
        var oldZoneId   = actor.getZoneId(),
            oldZone     = this.getZone(oldZoneId),
            newZone     = this.getZone(zoneId),
            tileIndex   = (coords ? newZone.xyToIndex(coords[0], coords[1]) : newZone.getDefaultSpawnPointIndex());
                
        if (newZone) {
            oldZone.removeActor(actor);
            newZone.addActor(actor, "PLAYER", tileIndex);            
        }
        else {
            console.log("Tried to teleport to " + zoneId + ", which doesn't exist!");
        }
    },
    
    actorIntersectsGoal: function(actor, tile, zone, tileIndex, tileData, layerIndex) {
        var layer        = zone.getBoard().getLayer(layerIndex),
            tileId       = zone.getTileId(tile);
        
        // TODO: make this more generic (work with multiple goals)        
        var oldAssassin = _(zone.getActors()).detect(function(otherActor) { 
            return otherActor.getRole() == Defs.ROLE_ASSASSIN;
        });
        
        layer.popTile(tileIndex, tileData);
        actor.setGoalInventory(tileData);
        
        if (oldAssassin) {
            oldAssassin.setRole(Defs.ROLE_SEEKER);
        }
    },
    
    actorDropGoal: function(actor) {
        var goal = actor.getGoalInventory();
        
        if (goal) {
            var successfullyDropped = false;
            var goalPoint = parseInt(actor.getTileIndex());
            
            // *****************************************
            // TODO: FIXME: VERY NAIVE ALGORITHM 
            // IF YOU'RE ON A BAD TILE, IT JUST KEEPS MOVING RGHT
            // UNTIL IT FINDS ONE THAT CAN BE DROPPED INTO.
            // THIS CAN CAUSE AN INFINITE LOOP IF IT NEVER FINDS ONE.
            while (!successfullyDropped) {
                successfullyDropped = this.placeGoal(
                    this.getZone(actor.getZoneId()),
                    goalPoint,
                    goal
                );
                goalPoint++;
            }
            actor.setRole(Defs.ROLE_ASSASSIN);
            actor.setGoalInventory(null);
        }
    },
    
    placeGoal: function(zone, tileIndex, tileData) {
        var layer   = zone.getBoard().getLayer(Defs.OBJECT_LAYER),
            exist   = layer.getTiles(tileIndex);
        
        if (exist && exist.length > 0) {
            return false;
        }
        else {
            layer.pushTile(tileIndex, tileData);
            return true;
        }
    },
    
    emptyZone: function(width, height) {
        return new Zone(this, null, {width: width || 64, height: height || 64});
    },
    
    generateDefaultZone: function(options) {
        var options = options || {},
            zone    = this.emptyZone(options.width, options.height),
            dims    = zone.getDimensions(),
            tileCnt = dims[0] * dims[1];

        for (var i = 0; i < tileCnt; i++) {
            zone.setLayerTile(0, i, options.baseTile || "BASE_GRASS");
        }

        zone.setLayerTile(1, 64, "SPAWN");

        return zone;
    },
    
    _loadZones: function(options) {
        var self = this;
        
        fs.readdir("zones", function(err, files) {
            if (err) {
                console.log("Could not find zone config directory!");
            }
            else {
                for (var i = 0, len = files.length; i < len; i++) {
                    fs.readFile("zones/" + files[i], function(err, data) {
                        var obj = JSON.parse(data);
                        self.createZoneFromConfig(obj);
                    });
                }
            }
        });
    },
    
    createZoneFromConfig: function(conf) {
        var zone    = this.emptyZone(conf.dimensions[0], conf.dimensions[1]),
            board   = zone.getBoard();
        
        for (var mli = 0, mllen = World.MAP_LAYER_KEYS.length; mli < mllen; mli++) {
            var confKey         = World.MAP_LAYER_KEYS[mli],
                confMapLayer    = conf[confKey];
                mapLayerStr     = confMapLayer.join(""),
                layer           = board.getLayer(mli);
            
            for (var i = 0, len = mapLayerStr.length; i < len; i++) {
                var ch = mapLayerStr.charAt(i);
                
                if (ch != " ") {
                    var lookup  = conf.tiles[ch],
                        tileId;
                    
                    if ((typeof lookup) == "string") {
                        tileId = lookup;
                    }
                    else {
                        var klass   = eval(lookup.class),
                            tile    = new klass(lookup.options);
                
                        tileId = zone.addTile(tile);
                    }
            
                    layer.pushTile(i, [ tileId ]);
                }
            }
        }
        
        if (conf.background) {
            zone.setBackground(conf.background);
        }
        
        if (conf.music) {
            zone.setMusic(conf.music);
        }
        
        this.setZone(conf.zoneId, zone);
    }
};