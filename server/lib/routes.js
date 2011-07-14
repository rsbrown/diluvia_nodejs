var Defs        = require("defs");

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
                        account:      req.session.account,
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
        req.session["store_location"] = '/play';
        res.render('world', {
            locals: { 
                sessionId:     req.session.id,
                play_music:    req.session.isMusicOn,
                selected_zone: req.session.selectedZone,
                flash:         req.flash(),
                username:      req.session.username
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
                    var world = this._gameServer.getWorld();
                    this.startNewIsland(req, res, function(newZone){
                      world.setZone(newZone.getId(), newZone);
                      res.redirect("/edit");
                    });
                } else {
                    req.flash("error", "You must login to build your island.");
                    res.redirect("/login");
                }
            }
        }
    },
    
    '/editor/tiles': {
      get: {
          middleware: ["loadUserSession"],
          exec: function(req, res) {
              if (req.session.account) {
                res.render('editor/tiles', {
                  layout: false,
                  locals: {
                    tiles:      Defs.Tiles
                  }
                });
              } else {
                  req.flash("error", "You must login to build your island.");
                  res.redirect("/login");
              }
          }
      }
    },
    
    '/editor/layers': {
      get: {
          middleware: ["loadUserSession"],
          exec: function(req, res) {
              if (req.session.account) {
                res.render('editor/layers', {
                  layout: false
                });
              } else {
                  req.flash("error", "You must login to build your island.");
                  res.redirect("/login");
              }
          }
      }
    },

    '/editor/zone': {
      get: {
          middleware: ["loadUserSession"],
          exec: function(req, res) {
              if (req.session.account) {
                var editingZoneId = req.session.account.getEditorZoneId();
                res.render('editor/zone', {
                  layout: false,
                  locals: {
                    editingZone: this._gameServer.getWorld().getZone(editingZoneId)
                  }
                });
              } else {
                  req.flash("error", "You must login to build your island.");
                  res.redirect("/login");
              }
          }
      },
      post: {
        middleware: ["loadUserSession"],
        exec: function(req, res) {
          if (req.session.account) {
            var editingZoneId = req.session.account.getEditorZoneId();
            this.updateZone(editingZoneId, req.body.zone);
            res.redirect("/edit");
          } else {
            req.flash("error", "You must login to build your island.");
            res.redirect("/login");
          }
        }
      }
    },
    
    '/editor/portal/:portalTileIdx': {
      get: {
          middleware: ["loadUserSession"],
          exec: function(req, res) {
              if (req.session.account) {
                this.getPortalInfo(req, function(portalInfo, portalTileIdx, zoneList){
                  res.render('editor/portal', {
                    layout: false,
                    locals: {
                      portal:   portalInfo,
                      tileIdx:  portalTileIdx,
                      tiles:    Defs.Tiles,
                      zones:    zoneList
                    }
                  });
                })
              } else {
                  req.flash("error", "You must login to build your island.");
                  res.redirect("/login");
              }
          }
      },
      post: {
        middleware: ["loadUserSession"],
        exec: function(req, res) {
          if (req.session.account) {
            this.setPortalInfo(req, function(){
              req.flash("info", "Portal info updated.");
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
      get: {
          middleware: ["loadUserSession"],
          exec: function(req, res) {
              if (req.session.account) {
                  var world = this._gameServer.getWorld();
                  this.createNewZone(req, res, function(newZone){
                    world.setZone(newZone.getId(), newZone);
                    res.redirect("/edit");
                  });
              } else {
                  req.flash("error", "You must login to build your island.");
                  res.redirect("/login");
              }
          }
      }
    },

    '/edit': {
      get: {
        middleware: ["loadUserSession"],
        exec: function(req, res){
            var self = this;
            req.session["store_location"] = '/edit';
            if (req.session.account) {
                self.getEditableZones(req.session.account, function(zoneList) {
                    res.render('editor', {
                        locals: {
                            sessionId:      req.session.id,
                            editingZoneId:  req.session.account.getEditorZoneId(),
                            zones:          zoneList,
                            username:       req.session.username,
                            flash:          req.flash()
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
