var io      = require("socket.io"),
    Client  = require("client"),
    World   = require("world"),
    Account = require("account"),
    PortalTile = require("portal_tile");
        
var Server = module.exports = function(app) {
    var socket      = io.listen(app),
        world       = new World();
    
    var defZone     = world.generateDefaultZone(),
        secondZone  = world.generateDefaultZone({ width: 32, height: 32, baseTile: "BASE_STONE" }),
        portalTile1 = defZone.addTile(new PortalTile({ "zone": "zones:2" })),
        portalTile2 = secondZone.addTile(new PortalTile({ "zone": World.DEFAULT_ZONE_ID }));

    defZone.setLayerTile(1, defZone.xyToIndex(2, 2), portalTile1);
    secondZone.setLayerTile(1, secondZone.xyToIndex(4, 4), portalTile2);

    world.setDefaultZone(defZone);    
    world.setZone("zones:2", secondZone);
    
    socket.on("connection", function(conn) {
        var account = new Account(world),
            client  = new Client(conn, account);

        world.addAccount(account);

        conn.on("message", function(msg) {
            console.log(msg);
            client.onMessage(msg);
        });

        conn.on("disconnect", function() {
            client.onDisconnect();
        });
    });
};