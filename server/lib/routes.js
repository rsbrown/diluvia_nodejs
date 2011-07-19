var Defs        = require("defs");

var Routes = module.exports = {
    '/': {
      get: {
        middleware: ["loadUserSession"],
        exec:function(req, res){
            req.session["store_location"] = '/';
            this.getIslands(req, res, function(userList) {
                res.render('index', {
                    locals: {
                        username:     req.session.username,
                        play_music:   req.session.isMusicOn,
                        account:      req.user,
                        users:        userList,
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
        req.session.startZoneId = req.params.zoneid;
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
                flash:         req.flash(),
                account:       req.user,
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

    '/create_island': {
        get: {
            middleware: ["loadUserSession"],
            exec: function(req, res) {
                if (req.user) {
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
    
    '/editor/save': {
      get: {
        middleware: ["loadUserSession"],
        exec: function(req, res) {
          var account = req.user;
          if (account) {
            this.saveEditorState(account.getId(), function(){
              res.send("SUCCESS");
            });
          } else {
            req.flash("error", "You must login to build your island.");
            res.redirect("/login");
          }
        }
      }
    },
    
    '/edit/:zoneid': {
      get: {
        middleware: ["loadUserSession"],
        exec: function(req, res) {
          var account = req.user;
          if (account) {
            account.setEditorZoneId(req.params.zoneid);
            account.save(function(){
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
              if (req.user) {
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
              if (req.user) {
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
              if (req.user) {
                var editingZoneId = req.user.getEditorZoneId();
                res.render('editor/zone', {
                  layout: false,
                  locals: {
                    editingZone: this._gameServer.getWorld().getZone(editingZoneId),
                    backgrounds: ["island1.png", "island2.png"],
                    musics: ["seiomaccorgo", "leyenda", "dungeon_music"]
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
          if (req.user) {
            var editingZoneId = req.user.getEditorZoneId();
            this.updateZone(req.user, editingZoneId, req.body.zone);
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
              if (req.user) {
                this.getPortalInfo(req, function(portalInfo, portalTileIdx, zoneList, accountList){
                  res.render('editor/portal', {
                    layout: false,
                    locals: {
                      portal:      portalInfo,
                      tileIdx:     portalTileIdx,
                      tiles:       Defs.Tiles,
                      zones:       zoneList,
                      myAccountId: req.user.getId(),
                      accounts:    accountList
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
          if (req.user) {
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
              if (req.user) {
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
            if (req.user) {
                self.getEditableZones(req.user, function(zoneList) {
                    res.render('editor', {
                        locals: {
                            sessionId:      req.session.id,
                            editingZoneId:  req.user.getEditorZoneId(),
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
