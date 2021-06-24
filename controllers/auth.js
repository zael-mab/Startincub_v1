const Startup = require('../models/Startups');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../midlleware/async');
const geocoder = require('../utils/geocoder');


// @desc    Register user
// @oute    GET /api/v1/auth/regster
// @access  Public
exports.register = asyncHandler(async(req, res, next) => {
    // res.status(200).json({ success: true });

});