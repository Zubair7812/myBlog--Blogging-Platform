const ensureAuthenticated = (req, res, next) => {
    if (req.session.user) {
        return next();
    }
    // Store original URL to redirect back after login? 
    // For now simple redirect
    res.redirect('/');
};

const ensureAdmin = (req, res, next) => {
    if (req.session.user && req.session.type === 'admin') {
        return next();
    }
    res.status(403).send("Access code invalid"); // Or redirect
};

module.exports = { ensureAuthenticated, ensureAdmin };
