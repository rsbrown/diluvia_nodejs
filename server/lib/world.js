var Defs        = require("defs"),
    Zone        = require("zone"),
    Tile        = require("tile"),
    SpawnTile   = require("spawn_tile"),
    PortalTile  = require("portal_tile"),
    WallTile    = require("wall_tile"),
    PainTile    = require("pain_tile"),
    fs          = require("fs");

var World = module.exports = function() {
    this._accounts      = [];
    this._defaultTiles  = [];
    this._zones         = {};
    
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
            this._zones[zoneId] = zone;
        }
        else {
            delete this._zones[zoneId];
        }
    },
    
    getZone: function(zoneId) {
        return this._zones[zoneId];
    },
        
    addAccount: function(account) {
        this._accounts.push(account);
        account.setCurrentZone(this.getDefaultZone());
        this.getDefaultZone().addAccount(account);
    },
    
    removeAccount: function(account) {
        var zone = account.getCurrentZone();
        zone.removeAccount(account);
        this._accounts.splice(this._accounts.indexOf(account), 1);
    },
    
    teleport: function(account, zoneId, coords) {
        var oldZone     = account.getCurrentZone(),
            newZone     = this.getZone(zoneId);
        
        if (newZone) {
            oldZone.removeAccount(account);
            account.setCurrentZone(newZone);
            newZone.addAccount(account, coords);
        }
        else {
            console.log("Tried to teleport to " + zoneId + ", which doesn't exist!");
        }
        
    },
    
    emptyZone: function(width, height) {
        return new Zone(width || 64, height || 64);
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
        var zone = this.emptyZone(conf.dimensions[0], conf.dimensions[1]);
        
        for (var mli = 0, mllen = World.MAP_LAYER_KEYS.length; mli < mllen; mli++) {
            var confKey         = World.MAP_LAYER_KEYS[mli],
                confMapLayer    = conf[confKey];
                mapLayerStr     = confMapLayer.join("");
            
            for (var i = 0, len = mapLayerStr.length; i < len; i++) {
                var ch = mapLayerStr.charAt(i);
                
                if (ch != " ") {
                    var lookup  = conf.tiles[ch],
                        tileIdx;
                    
                    if ((typeof lookup) == "string") {
                        tileIdx = lookup;
                    }
                    else {
                        var klass   = eval(lookup.class),
                            tile    = new klass(lookup.options);
                
                        tileIdx = zone.addTile(tile);
                    }
            
                    zone.setLayerTile(mli, i, tileIdx);
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