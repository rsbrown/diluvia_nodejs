var Zone    = require("zone");

var World = module.exports = function() {
    this._accounts = [];
};

var defaultZone = new Zone(3, 64, 64);

World.prototype = {
    addAccount: function(account) {
        this._accounts.push(account);
        
        defaultZone.addAccount(account);
        account.setCurrentZone(defaultZone);
    },
    
    removeAccount: function(account) {
        
    }
};