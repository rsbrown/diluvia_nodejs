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

var server = new Server(app);

var redirectBackOrRoot = function(req, res) {
    if (global["store_location"]) {
        res.redirect(global["store_location"]);
    } else {
        res.redirect("/");
    }
};

var preParseRequest = function(req, res, uname) {
    setUser(req, res, uname);
    if (!req.session.flash) {
        req.session.flash = {};
    }
    if (!req.session.flash.error) {req.session.flash.error = false;}
    if (!req.session.flash.warning) {req.session.flash.warning = false;}
    if (!req.session.flash.info) {req.session.flash.info = false;}
}

var setUser = function(req, res, user) {
    if (user) {
        username = req.session["username"] = user;
    }
    else if (req.query) {
        username = req.session["username"] = req.query["un"];
    }
    else {
        username = req.session["username"] = null;
    }
  
    if (username) {
        
        var uKey = "users:" + username;
        r.get(uKey, function(err, data) {
           if (!data) {
               r.set(uKey, "{}");
           } 
           else {
               userData = data;
           }
        });
        
        r.llen("users", function(err, data) {
           
           if (data && data > 0) {
      
               var i;
               var userKnown = false;
               var q;
               var self = this;
               for (i = 0; i < data; i++) {
                   console.log(i);
                   r.lindex("users", i, function(err, name) {
                       if (name.toString() == username) {
                           self.userKnown = true;
                       } 
                   });
                   if (self.userKnown) {
                       break;
                   }
               }
               if (!self.userKnown) {
                   r.rpush("users", username);
               }
           }
           else {
               r.rpush("users", username);
           }
        });
        
    }
};

var getUsers = function() {
  r.get("users", function(err, data) {
    if (!data) {
        return [];
    }  
    else {
        console.log(data);
        return data;
    }
  });
};

app.get('/', function(req, res){
    getUsers();
    preParseRequest(req, res);
    //req.session["isAuthenticated"] = false; 
    req.session["store_location"] = '/';
    //setZoneState();
    res.render('index', {locals: {username: username, flash: req.session.flash}});
});

app.get('/ping', function(req, res) {
    res.send('pong');
});

// Simple code to set the session and avoid twitter auth
app.get('/setSession/:user', function(req, res) {
   //setUser(req, res, req.params.user);
   preParseRequest(req, res, req.params.user);
   res.render('index', {locals: {username: username, flash: req.session.flash}});
});

app.get('/play', function(req, res){
  
  preParseRequest(req, res);
  req.session["store_location"] = '/play';
  res.render('world', {locals: {flash: req.session.flash}});
});


app.get('/play/:user', function(req, res) {
    preParseRequest(req, res);
    req.session["store_location"] = '/play';
    res.render('world', {locals: {flash: req.session.flash}});
});

app.get ('/auth/twitter', function(req, res, params) {
    preParseRequest(req, res);
    console.log(req);
    if (!req.session.auth) { 
        req.session.auth = {}; 
    }
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
                    username = req.session["username"] = req.getAuthDetails().user.username;
                    setUser(req, res, req.getAuthDetails().user.username);
                    redirectBackOrRoot(req, res);
                }
            );
        }
        else {
            req.session.flash.error = "Twitter authentication failed";
            res.render('index', {locals: {flash: req.session.flash, username: null}});
        }
    });
});

app.get('/edit', function(req, res){
  preParseRequest(req, res);
  req.session["store_location"] = '/edit';
  res.render('editor', {locals: {flash: req.session.flash}});
});


