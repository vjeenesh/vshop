exports.render404 = (req, res, next) => {
    // console.log(req.path);
    res.status(404).render('not-found.ejs', {pageTitle: '404 Not Found', path: req.path, isLoggedIn: req.session.isLoggedIn, username: req.session.user ? req.session.user[0].username : ''})
};


exports.render500 = (req, res, next) => {
    // console.log(req.path);
    res.status(500).render('error-500.ejs', {pageTitle: '500 Internal Server Error', path: req.path, isLoggedIn: req.session.isLoggedIn, username: req.session.user ? req.session.user[0].username : ''})
};