const User = require('../models/User');
const Startup = require('../models/Startups');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../midlleware/async');
const geocoder = require('../utils/geocoder');
const sendEmail = require('../utils/sendEmail');
const crypto = require('crypto');
const uploadPhoto = require('../midlleware/uploadphoto');
const jwt = require('jsonwebtoken');

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


// const uniqueString = require('unique-string');
const { emailVerifie } = require('../midlleware/auth');
// @desc    Register user
// @oute    POST /api/v1/auth/regster
// @access  Public
exports.register = asyncHandler(async(req, res, next) => {
    const { firstname, lastname, phone, email, password, mentoring } = req.body;

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
    if (req.files != null) {
        let file = req.files.file;
        file = uploadPhoto(file, user);
        user.logo = file.name;
        user.save();
    }
    // //
    emailVerifie(req, res, next, user);
    // Create Token
    sendTokenResponse(user, 200, res);
});



exports.verify = asyncHandler(async(req, res, next) => {

    const id = req.params.id;
    let decoded = jwt.verify(id, process.env.JWT_SECRET);

    console.log('!!!!!!!');
    console.log(decoded);

    let user = await User.findById(decoded);
    if (user) {
        if (!user.isVerified) {
            user.isVerified = true;
            await user.save();

            res.status(200).json({
                success: true,
                verified: true
            });

        } else {

            res.status(200).json({
                msg: "Already email Verified !"
            })
        }

    } else {
        res.status(200).json({
            success: false,
            verified: false,
            msg: "token broken"
        });
    }
    // // Check that the user didn't take too long
    // let dateNow = new Date();
    // let tokenTime = decoded.iat * 1000;

    // // Two hours
    // let hours = 2;
    // let tokenLife = hours * 60 * 1000;
    // console.log(tokenTime + tokenLife);

    // // User took too long to enter the code
    // if (tokenTime + tokenLife < dateNow.getTime()) {

    // }
});




// @desc    Login user
// @oute    POST /api/v1/auth/regster
// @access  Public
exports.login = asyncHandler(async(req, res, next) => {
    const { email, password } = req.body;
    // console.log(req.body);

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


// @desc    Log user out / Clear cookie
// @route   GET /api/v1/auth/logout
// @access  Private
exports.logout = asyncHandler(async(req, res, next) => {

    res.cookie('token', 'none', {
        expire: new Date(Date.now + 10 * 1000),
        httpOnly: true
    });


    res.status(200).json({
        success: true,
        data: {}
    });
});

// @desc    Get current loggoed in user
// @route   GET /api/v1/auth/me
// @access  Private
exports.getMe = asyncHandler(async(req, res, next) => {

    const user = await User.findById(req.user.id);
    // await delete user['firstname'];


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


// @desc    Update user photo
// @route   PUT /api/v1/auth/updatephoto
// @access  Private
exports.updatePhoto = asyncHandler(async(req, res, next) => {

    let user = await User.findById(req.user.id);

    if (req.files != null) {
        let file = req.files.file;
        file = uploadPhoto(file, user);
        user.logo = file.name;
        user.save();
    }

    sendTokenResponse(user, 200, res);
});



// @desc    Get user photo
// @oute    GET /api/v1/auth/:photoid
// @access  Private
exports.sendPhoto = asyncHandler(async(req, res, next) => {
    // console.log('-----------');
    // Set disposition and send it.
    let file = `/${process.cwd()}/public/uploads/${req.params.photoid}`;
    console.log(process.cwd());
    await res.status(200).sendFile(file);
});

// NEED TO ADD EMAIL VERIFICATION for the register !!! <------
// Send Emails for mentor and startup-users if any corection made

// @desc    Forgot password
// @route   POST /api/v1/auth/forgotpassword
// @access  Public
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