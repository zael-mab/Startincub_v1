const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../midlleware/async');
const geocoder = require('../utils/geocoder');


// @desc    Register user
// @oute    POST /api/v1/auth/regster
// @access  Public
exports.register = asyncHandler(async(req, res, next) => {
    const { name, email, password, role } = req.body;

    // Create user
    const user = await User.create({
        name,
        email,
        password,
        role
    });
    // Create Token
    const token = user.getSignedJwtToken();

    res.status(200).json({ success: true, data: user, token })
});


// @desc    Login user
// @oute    POST /api/v1/auth/regster
// @access  Public
exports.login = asyncHandler(async(req, res, next) => {
    const { email, password } = req.body;

    // Validate email and password
    if (!email || !password) {
        return next(new ErrorResponse('Please provide an email and password', 400));
    }
    // Check for a user
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
        return next(new ErrorResponse('Invalid credentials', 400));
    }

    // check if passord matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
        return next(new ErrorResponse('Invalid credentials', 400));
    }

    // Create Token
    const token = user.getSignedJwtToken();

    res.status(200).json({ success: true, data: user, token })
});