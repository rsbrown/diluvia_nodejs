module.exports = function revalidate() {
    return function revalidate(req, res, next) {
        res.headers["Cache-Control"] = "public max-age=0, must-revalidate";
        next();
    };
};

