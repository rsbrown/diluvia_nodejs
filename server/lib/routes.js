var Routes = module.exports = {
    '/': function(req, res){
        this.getUsers();
        this.preParseRequest(req, res);
        //req.session["isAuthenticated"] = false;
        req.session["store_location"] = '/';
        //setZoneState();
        res.render('index', { 
            locals: {
                username:   username,
                flash:      req.session.flash
            }
        });
    },

    '/ping': function(req, res) {
        res.send('pong');
    },

    // Simple code to set the session and avoid twitter auth
    '/setSession/:user': function(req, res) {
        //setUser(req, res, req.params.user);
        this.preParseRequest(req, res, req.params.user);
        res.render('index', {locals: {username: username, flash: req.session.flash}});
    },

    '/play': function(req, res){
        this.preParseRequest(req, res);
        req.session["store_location"] = '/play';
        res.render('world', { 
            locals: { 
                sessionId:  req.session.id,
                flash:      req.session.flash
            }
        });
    },

    '/play/:user': function(req, res) {
        this.preParseRequest(req, res);
        req.session["store_location"] = '/play';
        res.render('world', {locals: {flash: req.session.flash}});
    },

    '/auth/twitter': function(req, res, params) {
        this.preParseRequest(req, res);
        if (!req.session.auth) {
            req.session.auth = {};
        }
        req.authenticate(['twitter'], function(error, authenticated) {
                //console.log("authenticated: " + authenticated);
                if( authenticated ) {
                var oa= new OAuth(
                    "http://twitter.com/oauth/request_token",
                    "http://twitter.com/oauth/access_token",
                    twitterConsumerKey,
                    twitterConsumerSecret,
                    "1.0",
                    null,
                    "HMAC-SHA1");
                oa.getProtectedResource(
                    "http://twitter.com/statuses/user_timeline.xml",
                    "GET",
                    req.getAuthDetails()["twitter_oauth_token"],
                    req.getAuthDetails()["twitter_oauth_token_secret"],
                    function (error, data) {
                    username = req.session["username"] = req.getAuthDetails().user.username;
                    this.setUser(req, res, req.getAuthDetails().user.username);
                    redirectBackOrRoot(req, res);
                    }
                    );
                }
                else {
                    req.session.flash.error = "Twitter authentication failed";
                    res.render('index', {locals: {flash: req.session.flash, username: null}});
                }
        });
    },

    '/edit': function(req, res){
        this.preParseRequest(req, res);
        req.session["store_location"] = '/edit';
        res.render('editor', {locals: {flash: req.session.flash}});
    }
};
