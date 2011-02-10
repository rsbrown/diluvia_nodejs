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

var World = module.exports = function() {
    this._accounts      = [];
    this._defaultTiles  = [];
    this._zones         = {};
    this._online        = [];
    this._stateQueue    = [];

    setInterval(_(this._onFastInterval).bind(this), Defs.WORLD_FAST_INTERVAL);
    setInterval(_(this._onSlowInterval).bind(this), Defs.WORLD_SLOW_INTERVAL);
    
    this._loadZones();
    
    // delaying this to let zone files finish reading (TODO: kind of a hack)
    setTimeout(_(this.spawnSword).bind(this), 2000);
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
    
    _getAccountFromPlayer: function(player) {
        return _(this._online).detect(function (account) {
            return account.getPlayer() == player;
        });
    },
    
    _onSlowInterval: function() {
        var world       = this,
            currentTime = (new Date()).getTime();
        
        for (var i = 0, len = this._online.length; i < len; i++) {
            var account     = this._online[i],
                player      = account.getPlayer(),
                zone        = world.getZone(player.getZoneId());
            
            var goalCounter     = player.getGoalCounter(),
                lastGoalTime    = player.getLastGoalTime(),
                tDiff           = Math.floor(currentTime - lastGoalTime),
                goalInventory   = player.getGoalInventory(),
                incCounter      = true;
            
            if (goalInventory) {
                var goalTileId  = goalInventory[0],
                    tile        = zone.getTile(goalTileId);
                
                if (tile && tDiff > 0 && tile.goalType == "skull") {
                    player.setGoalCounter(goalCounter - tDiff);
                    incCounter = false;
                }
            }
            
            if (incCounter) {
                player.setGoalCounter(goalCounter + tDiff);
            }

            player.touchGoalTime();
        }  
    },
    
    _onFastInterval: function() {
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

    getAccountById: function(accountId) {
        return _(this._online).select(function(account) {
            return account.getId() == accountId;
        })[0];
    },

    playerInitialize: function(account, client) {
        var world   = this,
            player  = account.getPlayer();

        account.setClient(client);
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
                     Don't let them find your skull!"
                );
            } else {
                client.sendChat(Defs.CHAT_ALERT,
                    "You have lost your assassin abilities."
                );
            }
        });
        
        player.on("changeGoalInventory", function(goalInventory) {
            if (goalInventory != null) {
                var goalTileId  = goalInventory[0],
                    currentZone = world.getZone(player.getZoneId()),
                    goalTile    = currentZone.getTile(goalTileId);
                
                if (goalTile) {
                    if (goalTile.goalType == "skull") { 
                        client.sendChat(Defs.CHAT_ALERT,
                            "You found the skull! Quickly find a hiding place and press 'e' to drop it to become the assassin!"
                        );
                    }
                    else if (goalTile.goalType == "sword") {
                        client.sendChat(Defs.CHAT_ALERT,
                            "You picked up the Sword of Righteousness! You may strike down the assassin in a single blow by using the 'a' key!"
                        );
                        client.sendPlaySound("sword");
                    }
                }

            }
        });
        
        player.on("changeGoalCounter", function(goalCounter) {
            if (goalCounter == 0) {
                world.accountDeath(account);
                client.sendChat(Defs.CHAT_CRITICAL,
                    "You held the skull too long and died from exhaustion!"
                );
            }
        });
        
        player.on("tookDamage", function(damage, hitpoints) {
            client.sendPlaySound("ouch");
            client.sendFlash("red");
            
            if (hitpoints <= 0) {
                world.accountDeath(account);
            }
        });


        player.on('spell_message', function(message, flash, importance) {
            client.sendChat(importance || Defs.CHAT_ALERT, message);
            if (flash) {
                client.sendFlash(flash);
            }
        });
        player.on('deathBySpell', function(spellName, caster, deathMsg) {
            var casterAccount = world._getAccountFromPlayer(caster);
            if (casterAccount) {
                if (spellName == "ASSASSIN_POISON") {
                    casterAccount.addScore(Defs.REWARD_POISONER);
                }
            }

            world.accountDeath(account);                

        });

        
        player.on("died", function() {
            world.broadcastMessage(Defs.CHAT_INFO, account.getUsername() + " died!");
        });
    
        client.on("disconnect", function() {
            world.broadcastMessage(Defs.CHAT_SYSTEM, account.getUsername() + " disconnected.");
            
            account.save();
            world.accountRemove(account);
        });
        
        var zone = this.getZone(account.getPlayer().getZoneId());
        this.accountSpawn(account, zone, account.getPlayer().getTileIndex());
        client.sendChat(Defs.CHAT_ALERT, "Find the skull to become the assassin!");
        
        return player;
    },
    
    accountSpawn: function(account, zone, tileIdx) {
        var player  = account.getPlayer();
        
        if (zone === undefined) {
            zone = this.getDefaultZone();
        }
        
        if (tileIdx === undefined || tileIdx == null) {
            tileIdx = zone.getDefaultSpawnPointIndex();
        }
        
        this.placeAccountInZone(account, zone, tileIdx);
        zone.setPlayerTileForOrientation(player, player.getOrientation());
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
        player.setRole(Defs.ROLE_SEEKER);
        player.clearSpellAffects();
        
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
    
    // TODO: this method is _WAY_ too big now
    otherCommand: function(account, zone, command) {
        var client      = account.getClient(),
            player      = account.getPlayer(),
            tileIndex   = player.getTileIndex(),
            orientation = player.getOrientation(),
            otherIndex  = zone.indexForDirectionalMove(tileIndex, orientation),
            actors      = zone.getActors(),
            goalInv     = player.getGoalInventory();

        if (command == "attack") {
            var otherActors = [];
            
            // first, look for players that we would be attacking
            for (var i = 0, len = actors.length; i < len; i++) {
                var actor           = actors[i],
                    actorTileIndex  = actor.getTileIndex();
            
                if (actor != player && (actorTileIndex == otherIndex || actorTileIndex == tileIndex)) {
                    otherActors.push(actor);
                }
            }
            
            if (otherActors.length > 0) {
                if (player.getRole() == Defs.ROLE_ASSASSIN) {
                    _(otherActors).each(function(otherActor) {
                        player.castSpell(Defs.SPELLS.ASSASSIN_POISON, otherActor);                            
                    });
                }
                else if (goalInv) {                    
                    var tile = zone.getTile(goalInv[0]);
                    
                    if (tile && tile.goalType == "sword") {
                        // TODO: this account search is going to be costly to do on each swing
                        var assassinAccount = _(this._online).detect(function (account) {
                            return account.getPlayer().getRole() == Defs.ROLE_ASSASSIN;
                        });
                        
                        if (assassinAccount) {
                            var assassinPlayer = assassinAccount.getPlayer();

                            if (otherActors.indexOf(assassinPlayer) != -1) {
                                this.accountDeath(assassinAccount);
                                assassinAccount.getClient().sendChat(Defs.CHAT_CRITICAL, "You died by the sword!");
                                player.setGoalInventory(null);
                                this.spawnSword();
                            }
                        }
                    }
                }
            }
        }
        else if (command == "drop") {            
            if (goalInv) {
                var goalTile = zone.getTile(goalInv[0]);
                
                if (goalTile.goalType == "skull") {
                    player.setRole(Defs.ROLE_ASSASSIN);                    
                }
                
                this.actorDropGoal(player);
            }

        }
        else if (command == "scoreboard") {
            var scoreData = {};
            
            _(this._online).each(function(account) {
                scoreData[account.getUsername()] = account.getScore(); 
            });
            
            client.sendScoreData(scoreData);
        }
    },

    randomSpawnGoal: function(tileId) {
        var zoneKeys    = _.keys(this._zones),
            zoneCount   = zoneKeys.length - 1;
        
        for (var i = 0; i < 255; i++) {
            var randZoneKey = zoneKeys[Math.floor(Math.random() * zoneCount)],
                zone        = this._zones[randZoneKey],
                dims        = zone.getDimensions(),
                maxTile     = dims[0] * dims[1],
                randTile    = Math.floor(Math.random() * maxTile);
                board       = zone.getBoard(),
                baseLayer   = board.getLayer(Defs.BASE_LAYER),
                objLayer    = board.getLayer(Defs.OBJECT_LAYER);
            
            var objTiles    = objLayer.getTiles(randTile),
                baseTiles   = baseLayer.getTiles(randTile);
            
            if (baseTiles.length == 0 || (objTiles && objTiles.length > 0)) {
                continue;
            }

            // TODO: PASSING NULL HERE WILL EVENTUALLY BREAK SOMETHING
            if (!zone.isTileIndexPassableBy(randTile, null)) {
                continue;
            }
            
            objLayer.pushTile(randTile, [ tileId ]);
            break;
        }
    },
    
    spawnSword: function() {
        if (Defs.SPAWN_SWORD) {
            this.randomSpawnGoal("SWORD");
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
            newZone.setPlayerTileForOrientation(actor, actor.getOrientation());
        }
        else {
            console.log("Tried to teleport to " + zoneId + ", which doesn't exist!");
        }
    },
    
    actorIntersectsGoal: function(actor, tile, zone, tileIndex, tileData, layerIndex) {
        var layer       = zone.getBoard().getLayer(layerIndex),
            tileId      = zone.getTileId(tile),
            oldGoal     = actor.getGoalInventory();
        
        if (!oldGoal) {            
            if (tile.goalType == "skull") {
                // TODO: make this more generic (work with multiple goals)        
                var oldAssassinAccount = _(this._online).detect(function (account) {
                    return account.getPlayer().getRole() == Defs.ROLE_ASSASSIN;
                });
        
                if (oldAssassinAccount) {
                    oldAssassinAccount.getPlayer().setRole(Defs.ROLE_SEEKER);
                }        
            }
            else if (tile.goalType == "sword") {
                if (actor.getRole() == Defs.ROLE_ASSASSIN) {
                    // Assassin can't pick up sword!
                    return;
                }
                
                // Something we need to do?
            }
            else {
                return; // shouldn't be able to pick up things that aren't spec'd right
            }
        
            layer.popTile(tileIndex, tileData);
            actor.setGoalInventory(tileData);
        }
        else {
            // TODO: send message back to actor?
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
    },
    
    broadcastMessage: function(color, text) {
        _(this._online).each(function(account) {
            account.getClient().sendChat(color, text);
        });        
    },
    
    broadcastChat: function(username, text) {
        if (!text.match(/^\s*$/)) {
            this.broadcastMessage(Defs.CHAT_PLAYER, username + "> " + text);
        }
    }
};
