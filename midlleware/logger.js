// @desc Logs request to coonsole 
const logger = (req, res, next) => {
    console.log(`${req.method} ${req.protocol}://${req.get('host')}${req.originalUrl}`.brightBlue)
    next();
};
module.exports = logger;