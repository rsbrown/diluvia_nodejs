require.paths.unshift("./lib");
require.paths.unshift("./ext");

var express             = require("express"),
    Env                 = require("env"),
    Client              = require("client"),
    World               = require("world"),
    Account             = require("account"),
    connect             = require("connect"),
    GameServer          = require("game_server"),
    Account             = require("account"),
    Defs                = require("defs"),
    Zone                = require("zone"),
    Tile                = require("tile"),
    PlayerSpawnTile     = require("player_spawn_tile"),
    Routes              = require("routes"),
    Persistence         = require("persistence"),
    RedisStore          = require("connect-redis")(express),
    Web                 = require("web"),
    util                = require("util"),
    spawn               = require("child_process").spawn,
    staticProvider      = require("staticProvider");

    
// Find the last commit ID for git
var git = spawn("git", [ "rev-parse", "--short", "HEAD" ]);

git.stdout.on("data", function(data) {
    gitRevision         = data.toString().substring(0, data.length - 1);
    Defs.GIT_REVISION   = gitRevision;
    util.log("Diluvia Server version: " + gitRevision);
});

var STATIC_ROOT =  __dirname + "/public";

var app = express.createServer(
    express.bodyParser(),
    express.logger(),
    express.cookieParser(),
    express.session({
        secret:     Env.app_secret,
        store:      new RedisStore
    }),
    express.static(STATIC_ROOT)
);

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

var gameServer = new GameServer(app),
    web = new Web(app, gameServer);

app.listen(3000);