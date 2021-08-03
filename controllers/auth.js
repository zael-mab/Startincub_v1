const User = require('../models/User');
const Startup = require('../models/Startups');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../midlleware/async');
const geocoder = require('../utils/geocoder');
const sendEmail = require('../utils/sendEmail');
const crypto = require('crypto');



// @desc    check for user
// @oute    POST /api/v1/auth/check
// @access  Public
exports.check = asyncHandler(async(req, res, next) => {

    const dupUser = await User.findOne({
        email: req.body.email
    });
    let data = false;
    if (dupUser) {
        data = true;
    }
    console.log(data);
    res.status(200).json({
        data
    });
});



// @desc    Register user
// @oute    POST /api/v1/auth/regster
// @access  Public
exports.register = asyncHandler(async(req, res, next) => {
    const { firstname, lastname, phone, email, password, role, mentoring } = req.body;

    const dupUser = await User.findOne({
        email: req.body.email
    });
    if (dupUser) {
        return next(new ErrorResponse(`Email >${dupUser.email}<already used`, 401));
    }

    // Create user
    let user = await User.create({
        firstname,
        lastname,
        phone,
        email,
        password,
        mentoring,
    });

    // Create Token
    sendTokenResponse(user, 200, res);
});


// @desc    Login user
// @oute    POST /api/v1/auth/regster
// @access  Public
exports.login = asyncHandler(async(req, res, next) => {
    const { email, password } = req.body;
    console.log(req.body);

    // Validate email and password
    if (!email || !password) {
        return next(new ErrorResponse('Please provide an email and password', 400));
    }
    // Check for a user
    let user = await User.findOne({ email }).select('+password');

    if (!user) {
        return next(new ErrorResponse('Invalid credentials', 400));
    }
    // check if passord matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
        return next(new ErrorResponse('Invalid credentials', 400));
    }


    sendTokenResponse(user, 200, res);
});


// @desc    Get current loggoed in user
// @route   POST /api/v1/auth/me
// @access  Private
exports.getMe = asyncHandler(async(req, res, next) => {
    const user = await User.findById(req.user.id);

    await delete user['firstname'];


    res.status(200).json({
        success: true,
        data: user
    });
});


// @desc    Update user details
// @route   PUT /api/v1/auth/updatedetails
// @access  Private
exports.updateDetails = asyncHandler(async(req, res, next) => {
    const fieldsToUpdate = {
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        phone: req.body.phone,
        email: req.body.email
    };

    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
        new: true,
        runValidators: true
    });
    res.status(200).json({
        success: true,
        data: user
    });
});



// @desc    Update user password
// @route   PUT /api/v1/auth/updatepassword
// @access  Private
exports.updatePassword = asyncHandler(async(req, res, next) => {

    const user = await User.findById(req.user.id).select('+password');

    // Check current password
    if (await user.matchPassword(req.body.currentPassword)) {
        return next(new ErrorResponse('Password is incorrect', 401));
    }

    user.password = req.body.newPassword;
    await user.save();

    sendTokenResponse(user, 200, res);
});


// @desc    Forgot password
// @route   POST /api/v1/auth/forgotpassword
// @access  Pblic
exports.forgotPassword = asyncHandler(async(req, res, next) => {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
        return next(new ErrorResponse(`there is no user with that email ${req.body.email}`, 404));
    }

    // Get reset Token
    const resetToken = user.getResetPasswordToken();

    await user.save({ validateBeforeSave: false });

    // Create reset url
    const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/auth/resetpassword/${resetToken}`;

    const message = `You are recieving this email because you (or someone else) has requested the reset of a password.
    Please make a PUT request to: \n\n ${resetUrl}`;

    try {
        console.log('-------------------'.red);
        await sendEmail({
            email: user.email,
            subject: 'Password reset Token',
            message
        });
        res.status(200).json({ success: true, data: 'Email sent' });

    } catch (err) {
        console.log('*********************'.red);
        console.log(err);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save({ validateBeforeSave: false });

        return next(new ErrorResponse('Email could not be sent', 500));
    }
});



// @desc    Reset Password
// @route   PUT /api/v1/auth/resetpassword/:resettoken
// @access  Public
exports.resetPassword = asyncHandler(async(req, res, next) => {
    // Get hashed token
    const resetPasswordToken = crypto
        .createHash('sha256')
        .update(req.params.resettoken)
        .digest('hex');
    console.log(resetPasswordToken);
    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
        return next(new ErrorResponse(`Invalid Token`, 400));
    }

    // set the new password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    sendTokenResponse(user, 200, res);
});


//  Get token from model, create cookieand send response
const sendTokenResponse = async(user, statusCode, res) => {
    //Create token
    const token = user.getSignedJwtToken();
    let count = 0;
    if (user.role == 'admin') {
        count = await Startup.estimatedDocumentCount();
    }

    const options = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 3600 * 1000),
        httpOnly: true
    };

    if (process.env.NODE_ENV === 'production') {
        options.secure = true;
    }


    res
        .status(statusCode)
        .cookie('token', token, options)
        .json({
            success: true,
            data: user,
            count,
            token
        });
};