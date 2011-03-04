var Routes = module.exports = {
    '/': {
      get: {
        middleware: ["loadUserSession"],
        exec:function(req, res){
            req.session["store_location"] = '/';
            this.getIslands(req, res, function(islandList) {
                res.render('index', {
                    locals: {
                        username:     req.session.username,
                        play_music:   req.session.isMusicOn,
                        my_island:    req.session.myIslandId,  
                        islands:      islandList,
                        flash:        req.flash()
                    }
                });
            });
        }
      }
    },

    '/ping': {
      get: {
        exec:function(req, res) {
            res.send('pong');
        }
      }
    },

    '/goto/:zoneid': {
      get: {
        middleware: ["loadUserSession"],
        exec: function(req, res){
        req.session.selectedZone = req.params.zoneid;
        res.redirect("/play");
      }}
    },

    '/play': {
      get: {
        middleware: ["loadUserSession"],
        exec: function(req, res){
        // console.log(JSON.stringify(req.session));
        req.session["store_location"] = '/play';
        res.render('world', {
            locals: { 
                sessionId:  req.session.id,
                play_music: req.session.isMusicOn,
                selected_zone: req.session.selectedZone,
                flash:      req.flash(),
                username:   req.session.username
            }
        });
      }}
    },

    '/logout': {
      get: {exec:function(req, res) {
        req.session.destroy();
        this.redirectBackOrRoot(req, res);
      }}
    },

    '/login': {
      get: {exec:function(req, res) {
        res.render('login', {locals: {flash: req.flash(), username: req.session.username}});
      }}
    },

    '/auth/facebook': {
      get: {
          exec: function(req, res) {
              var self = this;
              req.authenticate(['facebook'], function(error, authenticated) { 
                  if(authenticated ) {
                      self.getAccountFromFacebookAuth(req.getAuthDetails(), function(account){
                          if (account) {
                              req.session.accountId = account.getId();
                          }
                          else {
                              req.session.flash.error = "Account validation failed";
                          }
                          self.redirectBackOrRoot(req, res);
                      });
                  }
                  else {
                      req.session.flash.error = "Facebook authentication failed";
                      self.redirectBackOrRoot(req, res);
                  }
              });
          }
      }
    },

    '/auth/twitter': {
      get: {exec: function(req, res) {
        req.authenticate(['twitter'], function(error, authenticated) {
                if( authenticated ) {
                    // CONGRATS, DO SOME STUFF
                } else {
                    req.session.flash.error = "Twitter authentication failed";
                    res.render('index', {locals: {flash: req.flash(), username: null}});
                }
        });
      }}
    },

    '/create_island': {
        get: {
            middleware: ["loadUserSession"],
            exec: function(req, res) {
                if (req.session.account) {
                    this.startNewIsland(req, res, function(){
                        res.redirect("/edit");
                    });
                } else {
                    req.flash("error", "You must login to build your island.");
                    res.redirect("/login");
                }
            }
        }
    },
    
    '/zones/new': {
    },

    '/zones/save': {
        post: {exec: function(req, res){
            this.updateZone(req.body.zone);
            res.redirect("/edit");
        }}
    },

    '/edit': {
      get: {
        middleware: ["loadUserSession"],
        exec: function(req, res){
            var self = this;
            req.session["store_location"] = '/edit';
            if (req.session.account) {
                self.getZones(function(zoneList) {
                    res.render('editor', {
                        locals: {
                            sessionId:  req.session.id,
                            zones:        zoneList,
                            username:     req.session.username,
                            flash:        req.flash()
                        }
                    });
                });
            } else {
                req.flash("error", "You must login to build your island.");
                res.redirect("/");
            }
        }
      }
    }
};
