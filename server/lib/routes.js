var Routes = module.exports = {
    '/': function(req, res){
        this.getUsers();
        this.preParseRequest(req, res);
        req.session["store_location"] = '/';
        res.render('index', { 
            locals: {
                username:   req.session["username"],
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
    
    '/logout': function(req, res) {
        req.session.username = null;
        this.redirectBackOrRoot(req, res);
    },

    '/auth/facebook': function(req, res) {
        var self = this;
      this.preParseRequest(req, res);
      req.authenticate(['facebook'], function(error, authenticated) { 
         if(authenticated ) {
            req.session.username = req.getAuthDetails()["user"]["name"];
            console.log(JSON.stringify(req.session));
            console.log(req.session.username);
            self.redirectBackOrRoot(req, res);
          }
          else {
            req.session.flash.error = "Facebook authentication failed";
            res.render('index', {locals: {flash: req.session.flash, username: null}});
          }
       });
    },

    '/auth/twitter': function(req, res, params) {
        this.preParseRequest(req, res);
        req.authenticate(['twitter'], function(error, authenticated) {
                console.log("authenticated: " + authenticated);
                if( authenticated ) {
                    // CONGRATS, DO SOME STUFF
                } else {
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
