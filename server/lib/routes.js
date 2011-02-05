var Routes = module.exports = {
    '/': function(req, res){
        this.preParseRequest(req, res);
        req.session["store_location"] = '/';
        this.loadUserSession(req, res, function(){
            res.render('index', {
                locals: {
                    username:     req.session.username,
                    play_music:   req.session.isMusicOn,
                    flash:        req.session.flash
                }
            });
        });
    },

    '/ping': function(req, res) {
        res.send('pong');
    },

    '/play': function(req, res){
        // console.log(JSON.stringify(req.session));
        this.preParseRequest(req, res);
        req.session["store_location"] = '/play';
        this.loadUserSession(req, res, function(){
            res.render('world', { 
                locals: { 
                    sessionId:  req.session.id,
                    play_music: req.session.isMusicOn,
                    flash:      req.session.flash,
                    username:   req.session.username
                }
            });
        });
    },

    '/play/:user': function(req, res) {
        this.preParseRequest(req, res);
        req.session["store_location"] = '/play';
        res.render('world', {locals: {flash: req.session.flash}});
    },
    
    '/logout': function(req, res) {
        req.session.destroy();
        this.redirectBackOrRoot(req, res);
    },

    '/auth/facebook': function(req, res) {
        var self = this;
        this.preParseRequest(req, res);
        req.authenticate(['facebook'], function(error, authenticated) { 
            if(authenticated ) {
                var account = self.getAccountFromFacebookAuth(req.getAuthDetails(), function(account){
                    req.session.accountId = account.getId();
                    self.redirectBackOrRoot(req, res);
                });
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
