var Utilities = module.exports = {
    bind: function(fn, scope) {
        return function() {
            return fn.apply(scope, arguments);
        }
    }
};
