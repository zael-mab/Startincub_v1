const User = require('../models/User');
const Startup = require('../models/Startups');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../midlleware/async');
const advencedResults = require('../midlleware/advencedResults');

// @desc    Get all users
// @oute    GET /api/v1/auth/users
// @access  Public/Admin
exports.getUsers = asyncHandler(async(req, res, next) => {
    res.status(200).json(res.advencedResults);
});

// @desc    Get a single user
// @oute    GET /api/v1/auth/users/:id
// @access  Public/Admin
exports.getUser = asyncHandler(async(req, res, next) => {
    const user = await User.findById(req.params.id);

    res.status(200).json({
        success: true,
        data: user
    });
});

// @desc    Create user
// @oute    POST /api/v1/auth/users
// @access  Public/Admin
exports.createUser = asyncHandler(async(req, res, next) => {
    const user = await User.create(req.body);

    res.status(201).json({
        success: true,
        data: user
    });
});


// @desc    Update user
// @oute    PUT /api/v1/auth/users/:id
// @access  Public/Admin
exports.updateUser = asyncHandler(async(req, res, next) => {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    res.status(200).json({
        success: true,
        data: user
    });
});


// @desc    Delete user
// @oute    DELETE /api/v1/auth/users/:id
// @access  Public/Admin
exports.deleteUser = asyncHandler(async(req, res, next) => {
    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({
        success: true,
        data: {}
    });
});


// @desc    Get startups to evaluate
// @oute    GET /api/v1/auth/users/startups
// @access  Public/Admin
exports.getStartupsToRate = asyncHandler(async(req, res, next) => {
    const user = await User.findById(req.user.id);
    // console.log(user);

    let startups = [];
    for (let i = 1; i < 6; i++) {
        let holder = 't_' + i.toString(10);
        // console.log(user.strtup[holder]);
        const tmp = await Startup.findById(user.strtup[holder]);
        if (tmp)
            startups.push(tmp);

    }
    // console.log(startups);

    res.status(200).json({
        success: true,
        data: startups
    });
});