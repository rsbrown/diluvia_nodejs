var io          = require("socket.io"),
    Client      = require("client"),
    World       = require("world"),
    Account     = require("account"),
    PortalTile  = require("portal_tile"),
    Util        = require("utilities"),
    Routes      = require("routes");

var Server = module.exports = function(app, redis) {
    this.socket     = io.listen(app);
    var world       = new World();
    this.redis = redis;

    for (var key in Routes) {
        app.get(key, Util.bind(Routes[key], this));
    }

    this.socket.on("connection", function(conn) {
        var account = new Account(world),
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
};


Server.prototype = {
    _redirectBackOrRoot: function(req, res) {
        if (global["store_location"]) {
            res.redirect(global["store_location"]);
          } else {
            res.redirect("/");
          }
    },

    _preParseRequest: function(req, res, uname) {
        this._setUser(req, res, uname);
        if (!req.session.flash) {
            req.session.flash = {};
        }
        if (!req.session.flash.error) {req.session.flash.error = false;}
        if (!req.session.flash.warning) {req.session.flash.warning = false;}
        if (!req.session.flash.info) {req.session.flash.info = false;}
    },

    _setUser: function(req, res, user) {
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
            this.redis.get(uKey, function(err, data) {
                if (!data) {
                    this.redis.set(uKey, "{}");
                }
                else {
                    userData = data;
                }
            });

            this.redis.llen("users", function(err, user_count) {
                var self        =  this,
                    userKnown   = false,
                    q;

                if (user_count && user_count > 0) {
                    for (i = 0; i < data; i++) {
                        this.redis.lindex("users", i, function(err, name) {
                            if (name.toString() == username) {
                                self.userKnown = true;
                            }
                        });
                        if (self.userKnown) {
                            break;
                        }
                    }
                    if (!self.userKnown) {
                        this.redis.rpush("users", username);
                    }
                }
                else {
                  this.redis.rpush("users", username);
                }
            });

        }
    },

    _getUsers: function() {
        this.redis.get("users", function(err, data) {
            if (!data) {
                return [];
            }
            else {
                return data;
            }
        });
    }
};
