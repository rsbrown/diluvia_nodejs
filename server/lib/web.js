var _           = require("underscore"),
    Persistence = require("persistence"),
    Routes      = require("routes");

var Web = module.exports = function(app) {
    var self = this;
    
    // Bind all the routes
    _(Routes).each(function(val, key) { 
        app.get(key, _(val).bind(self));
    });
};

Web.prototype = {
    redirectBackOrRoot: function(req, res) {
        if (global["store_location"]) {
            res.redirect(global["store_location"]);
          } else {
            res.redirect("/");
          }
    },

    preParseRequest: function(req, res, uname) {
        if (!req.session.flash) {
            req.session.flash = {};
        }
        if (!req.session.flash.error) {req.session.flash.error = false;}
        if (!req.session.flash.warning) {req.session.flash.warning = false;}
        if (!req.session.flash.info) {req.session.flash.info = false;}
    },
    setUser: function(req, res, user) {
        var redis = Persistence.getRedis();
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
            redis.get(uKey, function(err, data) {
                if (!data) {
                    redis.set(uKey, "{}");
                }
                else {
                    userData = data;
                }
            });

            redis.llen("users", function(err, user_count) {
                var self        =  this,
                    userKnown   = false,
                    q;

                if (user_count && user_count > 0) {
                    for (i = 0; i < data; i++) {
                        redis.lindex("users", i, function(err, name) {
                            if (name.toString() == username) {
                                self.userKnown = true;
                            }
                        });
                        if (self.userKnown) {
                            break;
                        }
                    }
                    if (!self.userKnown) {
                        redis.rpush("users", username);
                    }
                }
                else {
                  redis.rpush("users", username);
                }
            });
        }
    },
    getUsers: function() {
        var redis = Persistence.getRedis();
    
        redis.get("users", function(err, data) {
            if (!data) {
                return [];
            }
            else {
                return data;
            }
        });
    }
    
};