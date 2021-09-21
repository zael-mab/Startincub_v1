const jwt = require('jsonwebtoken');
const asyncHandler = require('./async');
const ErrorResponse = require('../utils/errorResponse');
const User = require('../models/User');

// Protect routes
exports.protect = asyncHandler(async(req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        // Set token from Bearer token in header 
        token = req.headers.authorization.split(' ')[1];
        // Set token from cookie
    } else if (req.cookies.token) {
        token = req.cookies.token;
    }

    // Make sure token exists
    if (!token) {
        return next(new ErrorResponse('Not authorized to access this route', 401));
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log(decoded);

        req.user = await User.findById(decoded.id);

        next();
    } catch (err) {
        return next(new ErrorResponse('Not authorized to access this route...', 401));
    }
});

// Grant access to specific roles
exports.authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return next(new ErrorResponse(`login first...`, 401));
        }
        if (!roles.includes(req.user.role)) {
            return next(new ErrorResponse(`User >${req.user.firstname}< role >${req.user.role}< is not authorized to access the route`, 403));
        }
        next();
    };
};

const sendEmail = require('../utils/sendEmail');

// email verified
exports.emailVerifie = (async(req, res, next, user) => {
    //
    const token = jwt.sign(user.id, process.env.JWT_SECRET);
    const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/auth/validate/${token}`;
    const message = `from startincub ....to validite your email ${resetUrl}`;

    // let emailData = 200;
    try {
        console.log('-------------------'.red);
        await sendEmail({
            email: user.email,
            subject: 'verify emial',
            message
        });
        // emailData = 201;

    } catch (err) {
        console.log('*********************'.red);
        console.log(err);

        return next(new ErrorResponse('Email could not be sent', 500));
    }

});