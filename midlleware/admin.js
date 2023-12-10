module.exports = function (req, res, next) {
    if (!req.user.isAdmin) {
        res.status(403).send('You are not an Admin!');
        return;
    }
    next();
}