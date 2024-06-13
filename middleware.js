module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.flash('error', 'you must be signed in to add new campgrounds!');
        return res.redirect('/login');
    }
    next();
}