const Startup = require('../models/Startups');
const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../midlleware/async');
const geocoder = require('../utils/geocoder');
const { clearStartups, clearMentors } = require('../midlleware/correction');

const path = require('path');
const fs = require('fs');

// @desc    check for Startup name
// @oute    GET /api/v1/Startups/check
// @access  Public
exports.check = asyncHandler(async(req, res, next) => {

    const startup = await Startup.findOne({
        Sname: req.body.Sname
    });
    console.log(startup);
    let data = false;
    if (startup) {
        data = true;
    }
    console.log(data);
    res.status(200).json({
        data
    });
});




// @desc    Get all startups
// @oute    GET /api/v1/Startups
// @access  Public
exports.getStartups = asyncHandler(async(req, res, next) => {
    const resl = await res.advencedResults;
    res.status(200).json(resl);
});

// @desc    Get single startup
// @oute    GET /api/v1/Startups/:id
// @access  Private
exports.getStartup = asyncHandler(async(req, res, next) => {

    const startup = await Startup.findById(req.params.id).populate({ path: 'user', select: 'firstname lastname email' });

    if (!startup) {
        return next(new ErrorResponse(`Startup not found with id of ${req.params.id}`), 404);
    }
    // CHANGE THE RES DATA
    res.status(200).json({ success: true, data: startup });
});

// @desc    Create new startup
// @oute    POST /api/v1/Startups/
// @access  Private
exports.createStartup = asyncHandler(async(req, res, next) => {
    // Add user to req.body
    req.body.user = req.user.id;
    let ownerUser = await User.findById(req.user.id);
    // check for  published Startup
    const publishedStartup = await Startup.findOne({ user: req.user.id });

    // If the user is not an admin, they can only add one Startup
    if (publishedStartup && req.user.role !== 'admin') {
        return next(new ErrorResponse(`The user with ID > ${ req.user.id } < and the name > ${ req.user.firstname } < has already published a startup `, 400));
    }

    // find mentors that can correct 
    let user = await User.find({
        role: 'mentor',
        mentoring: { $gte: 0 },
        mentoring: { $lt: 5 }
    });

    // check if there is more than 5 mentors
    let m_length = user.length > 5 ? 5 : user.length;
    req.body.tocorrect = m_length;

    // Create the Startup
    let startup = await Startup.create(req.body);
    var message = "";

    // find a mentor with less than 5 startups to evaluate
    if (m_length > 0) {

        // loop on the mentors
        for (let j = 0; j < m_length; j++) {
            for (let i = 0; i < 5; i++) {
                let holder0 = 'm_' + j.toString(10);
                let holder = 't_' + i.toString(10);
                if (!user[j].startup[holder]) {
                    user[j].startup[holder] = startup.id;
                    user[j].mentoring++;
                    startup.mentor[holder0].m_id = user[j].id;
                    break;
                }
            }
            await user[j].save();
        }

        // Update mentors id
        startup = await Startup.findByIdAndUpdate(startup.id, startup, {
            new: true,
            runValidators: true
        });
    } else {
        message = 'no mentor  found to evaluate...';
    }

    ownerUser.startupid = startup.id;
    await User.findByIdAndUpdate(ownerUser.id, ownerUser, {
        new: true,
        runValidators: true
    });

    res.status(201).json({
        success: true,
        msg: `Create new startup... ${message}`,
        id: startup.id
    });
});

// @desc    Update startup
// @oute    PUT /api/v1/Startups/:id
// @access  Private
exports.updateStartup = asyncHandler(async(req, res, next) => {


    let startup = await Startup.findById(req.params.id);

    if (!startup)
        return next(new ErrorResponse(`Startup not found with id of ${ req.params.id }`), 404);

    // Make sure user is startup owner
    console.log(req.user);
    // if (startup.user.toString() !== req.user.id && req.user.role !== 'admin') {
    //     return next(new ErrorResponse(`User > ${ req.user.id } < is not autorized to update this Startup `), 401);
    // }

    // 
    const fieldsToUpdate = {
        Sname: req.body.Sname,
        website: req.body.website,
        address: req.body.address,
        phone: req.body.phone
    };
    // console.log(fieldsToUpdate);
    // 
    // delete req.body.mentor;
    // delete req.body.form;
    // delete req.body.tocorrect;
    // delete req.body.evaluated;
    // delete req.body.finelgrade;

    startup = await Startup.findByIdAndUpdate(req.params.id, fieldsToUpdate, {
        new: true,
        runValidators: true
    });
    res.status(200).json({ succes: true, ddata: startup });
});

// @desc    Delete startup
// @oute    DELETE /api/v1/Startups/:id
// @access  Private
exports.deleteStartup = asyncHandler(async(req, res, next) => {

    const startup = await Startup.findById(req.params.id);

    if (!startup) {
        return next(
            new ErrorResponse(`Startup not found with id of ${req.params.id}`),
            404);
    }

    // Make sure user is Startup owner.
    if (startup.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new ErrorResponse(`User > ${req.user.id} < is not autorized to delete this Startup `), 401);
    }

    // delete the photos
    let file = `/${process.cwd()}/public/uploads/${startup.logo}`;
    if (fs.existsSync(file)) {
        console.log('file exist');

        try {
            fs.unlinkSync(file);
            console.log("File is deleted.");
        } catch (err) {
            console.log(err);
        }
    }

    // delete the link with Mentors
    clearMentors(startup);
    // delete the creater
    const creater = await User.findById(startup.user);
    if (creater.role == 'user') {
        creater.remove();
    }

    startup.remove();

    res.status(200).json({
        success: true,
        data: {}
    });
});



// @desc    Get startup
// @oute    GET /api/v1/Startups/redius/:zipcode/:distance
// @access  Private
exports.getStartupsInRadius = asyncHandler(async(req, res, next) => {
    const { zipcode, distance } = req.params;

    // Get lat/lng from geocoder
    const loc = await geocoder.geocode(zipcode);

    const i = loc.length;
    // console.log('--------------'.blue);
    // console.log(loc);

    //  *** Need more specifications , the zip code is not accurate *** 
    const p = loc.map((place, i) => {
        console.log(`${ place.countryCode } === > $ { i }`);
    });

    const lat = loc[i - 1].latitude;
    const lng = loc[i - 1].longitude;

    // Calc raduius using radians
    // Divide dist by radius of Earth
    // Earth  RAdius = 6,378 Km
    const radius = distance / 6378;
    const startups = await Startup.find({
        location: {
            $geoWithin: {
                $centerSphere: [
                    [lng, lat], radius
                ]
            }
        }
    });

    res.status(200).json({
        success: true,
        count: startups.length,
        data: startups
    });
});

// @desc    Get startup
// @oute    GET /api/v1/Startups/photo/:photoid
// @access  Private
exports.sendPhoto = asyncHandler(async(req, res, next) => {
    // console.log('-----------');
    // Set disposition and send it.
    let file = `/${process.cwd()}/public/uploads/${req.params.photoid}`;
    console.log(process.cwd());
    await res.status(200).sendFile(file);
});

const uploadPhoto = require('../midlleware/uploadphoto');

// @desc    Upload startup
// @oute    PUT /api/v1/Startups/:id/photo
// @access  Private
exports.StartupPhotoUpload = asyncHandler(async(req, res, next) => {

    console.log(req.body);
    const startup = await Startup.findById(req.params.id);

    if (!startup) {
        return next(
            new ErrorResponse(`Startup not found with id of ${req.params.id}`),
            404);
    }

    // Make sure user is Startup Owner
    if (startup.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new ErrorResponse(`User > ${req.user.id} < is not autorized to update this Startup `), 401);
    }

    if (!req.files) {
        return (next(new ErrorResponse(`Please upload a file `, 400)));
    }

    let file = req.files.file;
    file = uploadPhoto(file, startup);

    await Startup.findByIdAndUpdate(req.params.id, { logo: file.name });
    res.status(200).json({
        success: true,
        data: file.name
    });

});