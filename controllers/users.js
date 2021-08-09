const User = require('../models/User');
const Startup = require('../models/Startups');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../midlleware/async');
const advencedResults = require('../midlleware/advencedResults');
const { clearStartups, clearMentors } = require('../midlleware/correction');
const uploadPhoto = require('../midlleware/uploadphoto');
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
    delete req.body.startup;
    delete req.body.startupid;
    delete req.body.mentoring;

    const dupUser = await User.findOne({
        email: req.body.email
    });
    if (dupUser) {
        return next(new ErrorResponse(`Email >${dupUser.email}< already used...`, 401));
    }

    let user = await User.create(req.body);

    if (req.files != null) {
        let file = req.files.file;
        file = uploadPhoto(file, user);
        user.logo = file.name;
        user.save();
    }

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

    // 
    const user = await User.findById(req.params.id);
    if (!user) {
        return next(new ErrorResponse(`user with id <${req.params.id}> not found...`, 401));
    }
    if (user.role == 'mentor' && user.mentoring > 0) {
        await clearStartups(user);
    }
    // 

    await User.findByIdAndDelete(req.params.id);
    if (user.startupid) {
        let startup = await Startup.findById(user.startupid);
        clearMentors(startup);
        await Startup.findByIdAndDelete(user.startupid);
    }

    res.status(200).json({
        success: true,
        data: {}
    });
});