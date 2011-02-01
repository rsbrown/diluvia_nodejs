require.paths.unshift("./lib");
require.paths.unshift("./ext");

var express     = require("express"),
    io          = require("socket.io"),
    redis       = require("redis-client"),
    Env         = require("env"),
    Client      = require("client"),
    World       = require("world"),
    Account     = require("account"),
    connect     = require("connect"),
    auth        = require("connect-auth"),
    Server      = require("server"),
    OAuth       = require('oauth').OAuth,
    Defs        = require("defs"),
    Zone        = require("zone"),
    Tile        = require("tile"),
    SpawnTile   = require("spawn_tile");


var r = redis.createClient();
var username = null;
var uidCounter      = 0;
var userData = {};

r.stream.on( 'connect', function() {
  var zoneKey = username ? "island:" + username : "default";
  r.get( zoneKey, function( err, data ) {

    var defaultZone = new Zone(64, 64);
    var defaultTile = new Tile({image: Defs.Tiles.BASE_GRASS}),
    spawnTile       = new SpawnTile();
    var defaultTileIdx = defaultZone.addTile(defaultTile);
    var spawnTileIdx   = defaultZone.addTile(spawnTile);

    if (!data) {
      for (var i = 0; i < (64 * 64); i++) {
          defaultZone.setLayerTile(0, i, defaultTileIdx);
      }

      defaultZone.setLayerTile(1, 64, spawnTileIdx);

      r.set( zoneKey, JSON.stringify(defaultZone), function() {
        console.log("CREATED NEW MAP");
      });
    } else {
      var obj = JSON.parse( data.toString() );
      defaultZone.setLayers(obj["_layers"]);
      console.log("MAP IS ALREADY THERE");
    }
    var world = new World();
    world.setDefaultZone(defaultZone);
  });
});
    

try {
    var keys = require('./auth_keys');
    for(var key in keys) {
        global[key] = keys[key];
    }
}
catch(e) {
    console.log('Unable to locate the auth_keys.js file');
    return;
}

var twitterSecrets = {consumerKey: twitterConsumerKey, consumerSecret: twitterConsumerSecret};
var app = express.createServer();

app.use(express.staticProvider(__dirname + "/public"));
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.bodyDecoder());
app.use(express.cookieDecoder());
app.use(express.session({key: '69c39bb0-2c14-11e0-91fa-0800200c9a66',
                         secret: 'mooninites7b67c080'
                         }));
                         
app.use(connect.cookieDecoder());
app.use(auth([auth.Twitter(twitterSecrets)]));

app.listen(3000);

var server = new Server(app, r);



