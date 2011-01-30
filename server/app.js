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

var redirectBackOrRoot = function(res) {
    if (global["store_location"]) {
        res.redirect(global["store_location"]);
    } else {
        res.redirect("/");
    }
};

var preParseRequest = function(req, res) {
    if (req.query["un"]) {
        req.session["username"] = req.query["un"];
    }
    if (!req.session.flash) {
        req.session.flash = {};
    }
    if (!req.session.flash.error) {req.session.flash.error = false;}
    if (!req.session.flash.warning) {req.session.flash.warning = false;}
    if (!req.session.flash.info) {req.session.flash.info = false;}
}

app.get('/', function(req, res){
    preParseRequest(req, res);
    //req.session["isAuthenticated"] = false; 
    req.session["store_location"] = '/';
    res.render('index', {locals: {username: req.session["username"], flash: req.session.flash}});
});

app.get('/play', function(req, res){
  preParseRequest(req, res);
  req.session["store_location"] = '/play';
  res.render('world', {locals: {flash: req.session.flash}});
});

app.get ('/auth/twitter', function(req, res, params) {
    preParseRequest(req, res);
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
                    req.session["username"] = req.getAuthDetails().user.username;
                    
                    redirectBackOrRoot(req, res);
                    //res.writeHead(200, {'Content-Type': 'text/html'});
                    //res.end("<html><h1>Hello! Twitter authenticated user ("+req.getAuthDetails().user.username+")</h1>"+data+ "</html>");
                }
            );
        }
        else {
            req.session.flash.error = "Twitter authentication failed";
            res.render('index', {locals: {flash: req.session.flash, username: null}});
            //redirectBackOrRoot(req, res);
            //res.writeHead(200, {'Content-Type': 'text/html'})
            //res.end("<html><h1>Twitter authentication failed :( </h1></html>")
        }
    });
});

app.get('/edit', function(req, res){
  preParseRequest(req, res);
  req.session["store_location"] = '/edit';
  res.render('editor', {locals: {flash: req.session.flash}});
});


