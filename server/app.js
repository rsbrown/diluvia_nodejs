require.paths.unshift("./lib");

var express = require("express"),
    io      = require("socket.io"),
    redis   = require("redis-client"),
    Env     = require("env"),
    Client  = require("client"),
    World   = require("world"),
    Account = require("account"),
    connect = require("connect"),
    auth    = require("connect-auth"),
    OAuth = require('oauth').OAuth;
    
var Defs        = require("defs"),
    Zone        = require("zone"),
    Tile        = require("tile"),
    SpawnTile   = require("spawn_tile");

var r = redis.createClient();
r.stream.on( 'connect', function() {
  r.get( 'default', function( err, data ) {

    var defaultZone = new Zone(64, 64);
    var defaultTile = new Tile({image: Defs.Images.baseTile}),
    spawnTile       = new SpawnTile();
    var defaultTileIdx = defaultZone.addTile(defaultTile);
    var spawnTileIdx   = defaultZone.addTile(spawnTile);
    
    if (!data) {
      for (var i = 0; i < (64 * 64); i++) {
          defaultZone.setLayerTile(0, i, defaultTileIdx);
      }

      defaultZone.setLayerTile(1, 64, spawnTileIdx);
      
      r.set( 'default', JSON.stringify(defaultZone), function() {
        console.log("CREATED NEW MAP");
      });
    } else {
      var obj = JSON.parse( data.toString() );
      defaultZone.setLayers(obj["_layers"]);
      console.log("MAP IS ALREADY THERE");
    }
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

var socket      = io.listen(app),
    world       = new World();
    
var redirectBackOrRoot = function(res) {
    if (global["store_location"]) {
        res.redirect(global["store_location"]);
    } else {
        res.redirect("/");
    }
};

app.get('/', function(req, res){
    global["isAuthenticated"] = false; 
    global["store_location"] = '/';
    res.render('index');
});

app.get('/play', function(req, res){
  global["store_location"] = '/play';
  res.render('world');
});

app.get ('/auth/twitter', function(req, res, params) {
    console.log(req);
    if (!req.session.auth) { req.session.auth = {}; }
    req.authenticate(['twitter'], function(error, authenticated) { 
        //console.log("authenticated: " + authenticated);
        if( authenticated ) {
            var oa= new OAuth("http://twitter.com/oauth/request_token",
                "http://twitter.com/oauth/access_token",
                twitterConsumerKey,
                twitterConsumerSecret,
                "1.0",
                null,
                "HMAC-SHA1");
            oa.getProtectedResource("http://twitter.com/statuses/user_timeline.xml", "GET",
                req.getAuthDetails()["twitter_oauth_token"], req.getAuthDetails()["twitter_oauth_token_secret"],  function (error, data) {
                    global["username"] = req.getAuthDetails().user.username;
                    
                    redirectBackOrRoot(res);
                    //res.writeHead(200, {'Content-Type': 'text/html'});
                    //res.end("<html><h1>Hello! Twitter authenticated user ("+req.getAuthDetails().user.username+")</h1>"+data+ "</html>");
                }
            );
        }
        else {
            res.writeHead(200, {'Content-Type': 'text/html'})
            res.end("<html><h1>Twitter authentication failed :( </h1></html>")
        }
    });
});

app.get('/edit', function(req, res){
  global["store_location"] = '/edit';
  res.render('editor');
});

socket.on("connection", function(conn) {
    var account = new Account(),
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
