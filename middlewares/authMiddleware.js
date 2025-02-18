function isAuthenticated(req, res, next) {
    if (req.session && req.session.user) {
        return next();
    } else {
        res.redirect("/sign_in");
    }
}

module.exports = isAuthenticated;
