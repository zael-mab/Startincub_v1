const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../midlleware/async');
const geocoder = require('../utils/geocoder');


// @desc    Register user
// @oute    GET /api/v1/auth/regster
// @access  Public
exports.register = asyncHandler(async(req, res, next) => {
    // res.status(200).json({ success: true });
    const { name, email, password, role } = req.body;

    // Create user
    const user = await User.create({
        name,
        email,
        password,
        role
    });
    res.status(200).json({ success: true, data: user })
});