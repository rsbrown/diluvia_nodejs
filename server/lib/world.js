var _           = require("underscore"),
    events      = require("events"),
    fs          = require("fs"),
    Defs        = require("defs"),
    Zone        = require("zone"),
    Tile        = require("tile"),
    SpawnTile   = require("spawn_tile"),
    PortalTile  = require("portal_tile"),
    WallTile    = require("wall_tile"),
    PainTile    = require("pain_tile"),
    GoalTile    = require("goal_tile"),
    Player      = require("player"),
    Fence       = require("fence");

var World = module.exports = function() {
    events.EventEmitter.call(this);
    
    this._accounts      = [];
    this._defaultTiles  = [];
    this._zones         = {};
    this._online        = [];
    this._stateQueue    = [];
    
    var world = this;
    
    this._loadZones(function() {
        world.emit("loaded");
    });
    
    setInterval(_(this._onFastInterval).bind(this), Defs.WORLD_FAST_INTERVAL);
    setInterval(_(this._onSlowInterval).bind(this), Defs.WORLD_SLOW_INTERVAL);
};

World.DEFAULT_ZONE_ID   = "0";

_.extend(World.prototype, events.EventEmitter.prototype, {
    setDefaultZone: function(zone) {
        this._zones[World.DEFAULT_ZONE_ID] = zone;
    },
    
    getDefaultZone: function() {
        // return this._zones[World.DEFAULT_ZONE_ID];
        for (zoneId in this._zones) {
          return this._zones[zoneId];
        }
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
        this._processStateQueue();
    },
    
    _processStateQueue: function() {
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
                        world.composeZoneStateFor(account, state)
                    )
                });
            }

            this._stateQueue = [];
        }
    },
    
    _hookZone: function(zone) {
        var self    = this,
            board   = zone.getBoard();
            
        zone.setWorld(this);
                
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

    connectPlayer: function(account, server, callback) {
        var self = this;
        self.initializePlayer(account);
        callback.call(server, account);
    },
    
    initializePlayer: function(account) {
        var world   = this,
            client  = account.getClient(),
            player  = account.getPlayer();

        world._online.push(account);
        
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
                // async this account death on purpose
                setTimeout(function() {
                    world.accountDeath(account);
                }, 0);
            }
        });

        player.on("spellEvent", function(eventName, spellAffect) {
            function sendSpellEventChat(msg) {
                if (msg) {
                    client.sendChat(msg.importance || Defs.CHAT_ALERT, msg.message);
                
                    if (msg.flash) {
                        client.sendFlash(msg.flash);
                    }
                }
            }
            
            if (spellAffect.getCaster() == player) {
                sendSpellEventChat(spellAffect.getCasterEventMessage(eventName));

                if (eventName == "completed" && spellAffect.getSpell() == Defs.SPELLS.ASSASSIN_POISON) {
                    var account = world._getAccountFromPlayer(player);

                    if (account) {
                        account.addScore(Defs.REWARD_POISONER);
                    }
                }
            }
            
            if (spellAffect.getTarget() == player) {
                sendSpellEventChat(spellAffect.getTargetEventMessage(eventName));
            }
        });
        
        player.on("landed", function() {
            player.suspendSpellTargetabilityFor(Defs.PORTAL_INVULN_DELAY); 
        });

        player.on("died", function() {
            world.broadcastMessage(Defs.CHAT_INFO, account.getUsername() + " died!");
        });
        
        client.on("disconnect", function() {
            world.broadcastMessage(Defs.CHAT_SYSTEM, account.getUsername() + " disconnected.");
            account.save();
            world.accountRemove(account);
        });
        
        var zone = world.getZone(account.getPlayer().getZoneId());
        world.accountSpawn(account, zone, account.getPlayer().getTileIndex());
        client.sendChat(Defs.CHAT_ALERT, "Find the skull to become the assassin!");
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
        player.unspawn();
        
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
    
    composeZoneStateFor: function(account, zoneState) {
        return {
            "viewCenterIdx":    account.getCenterViewTileIndex(),
            "layers":           zoneState
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
                        Defs.SPELLS.ASSASSIN_POISON.cast(player, otherActor);
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
            newZone     = this.getZone(zoneId);
        
        if (newZone) {
            var tileIndex = (coords ? newZone.xyToIndex(coords[0], coords[1]) : newZone.getDefaultSpawnPointIndex());
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
            var successfullyDropped = false,
                goalPoint           = parseInt(actor.getTileIndex()),
                zone                = this.getZone(actor.getZoneId()),
                maxIndex            = zone.getMaxIndex();
            
            // *****************************************
            // TODO: FIXME: VERY NAIVE ALGORITHM 
            // IF YOU'RE ON A BAD TILE, IT JUST KEEPS MOVING RGHT
            // UNTIL IT FINDS ONE THAT CAN BE DROPPED INTO.
            // THIS CAN CAUSE AN INFINITE LOOP IF IT NEVER FINDS ONE.
            while (!successfullyDropped) {
                if (goalPoint > maxIndex) {
                    goalPoint = 0;
                }
                
                successfullyDropped = this.placeGoal(zone, goalPoint++, goal, actor);
            }
            
            actor.setGoalInventory(null);
        }
    },
    
    placeGoal: function(zone, tileIndex, tileData, actor) {
        var layer   = zone.getBoard().getLayer(Defs.OBJECT_LAYER),
            exist   = layer.getTiles(tileIndex);
        
        if ((exist && exist.length > 0) || !zone.isTileIndexPassableBy(tileIndex, actor)) {
            return false;
        }
        else {
            layer.pushTile(tileIndex, tileData);
            return true;
        }
    },
    
    setZoneFromConfig: function(zoneConfig) {
        var zone = new Zone(zoneConfig);
        zone.loadConfig(zoneConfig.config);
        this.setZone(zone.getId(), zone);
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
    },
    
    _loadZones: function(callback) {
        var world   = this,
            fence   = new Fence(callback);
        
        // fs.readdir("zones", function(err, files) {
        //     if (err) {
        //         console.log("Could not find zone config directory!");
        //     }
        //     else {
        //         _(files).each(function(filename) {
        //             fs.readFile("zones/" + filename, fence.tap(function(err, data) {
        //                 world.createZoneFromConfig(JSON.parse(data));
        //             }));
        //         });
        //     }
        // });
        
        Zone.findAll(fence.tap(function(zones){
          _(zones).each(function(zone){
              world.setZoneFromConfig(zone);
          });
        }));
    }
});
