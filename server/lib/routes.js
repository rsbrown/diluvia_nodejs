var Routes = module.exports = {
    '/': {
      get: function(req, res){
        req.session["store_location"] = '/';
        this.loadUserSession(req, res, function(){
            res.render('index', {
                locals: {
                    username:     req.session.username,
                    play_music:   req.session.isMusicOn,
                    flash:        req.flash()
                }
            });
        });
      }
    },

    '/ping': {
      get: function(req, res) {
        res.send('pong');
      }
    },

    '/play': {
      get: function(req, res){
        // console.log(JSON.stringify(req.session));
        req.session["store_location"] = '/play';
        this.loadUserSession(req, res, function(){
            res.render('world', { 
                locals: { 
                    sessionId:  req.session.id,
                    play_music: req.session.isMusicOn,
                    flash:      req.flash(),
                    username:   req.session.username
                }
            });
        });
      }
    },

    '/play/:user': {
      get: function(req, res) {
        req.session["store_location"] = '/play';
        res.render('world', {locals: {flash: req.flash()}});
      }
    },
    
    '/logout': {
      get: function(req, res) {
        req.session.destroy();
        this.redirectBackOrRoot(req, res);
      }
    },

    '/auth/facebook': {
      get: function(req, res) {
        var self = this;
        req.authenticate(['facebook'], function(error, authenticated) { 
            if(authenticated ) {
                var account = self.getAccountFromFacebookAuth(req.getAuthDetails(), function(account){
                    req.session.accountId = account.getId();
                    self.redirectBackOrRoot(req, res);
                });
            }
            else {
                req.session.flash.error = "Facebook authentication failed";
                res.render('index', {locals: {flash: req.flash(), username: null}});
            }
        });
      }
    },

    '/auth/twitter': {
      get: function(req, res, params) {
        req.authenticate(['twitter'], function(error, authenticated) {
                if( authenticated ) {
                    // CONGRATS, DO SOME STUFF
                } else {
                    req.session.flash.error = "Twitter authentication failed";
                    res.render('index', {locals: {flash: req.flash(), username: null}});
                }
        });
      }
    },
    
    '/zones/new': {
    },

    '/edit': {
      get: function(req, res){
        req.session["store_location"] = '/edit';
        this.loadUserSession(req, res, function(loggedIn){
            if (loggedIn) {
                res.render('editor', {
                    locals: {
                        zones:        Zone.findAllZones(),
                        username:     req.session.username,
                        flash:        req.flash()
                    }
                });
            } else {
                req.flash("error", "You must login to build your island.");
                res.redirect("/");
            }
        });
      }
    }
};
