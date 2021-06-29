const Startup = require('../models/Startups');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../midlleware/async');
const geocoder = require('../utils/geocoder');
const path = require('path');

// @desc    Get all startups
// @oute    GET /api/v1/Startups
// @access  Public
exports.getStartups = asyncHandler(async(req, res, next) => {
    const resl = await res.advencedResults;
    res.status(200).json(resl);
})

// @desc    Get single startup
// @oute    GET /api/v1/Startups/:id
// @access  Private
exports.getStartup = asyncHandler(async(req, res, next) => {
    const startup = await Startup.findById(req.params.id).populate('courses');

    if (!startup) {
        return next(new ErrorResponse(`Startup not found with id of ${req.params.id}`), 404);
    }

    res.status(200).json({ success: true, data: startup });
});

// @desc    Create new startup
// @oute    POST /api/v1/Startups/
// @access  Private
exports.createStartup = asyncHandler(async(req, res, next) => {
    // Add user to req.body
    req.body.user = req.user.id;

    // check for  published Startup
    const publishedStartup = await Startup.findOne({ user: req.user.id });
    // If the user is not an admin, they can only add one Startup
    if (publishedStartup && req.user.role !== 'admin') {
        return next(new ErrorResponse(`The user with ID >${req.user.id}< and the name >${req.user.name}< has already published a startup`, 400));
    }

    const startup = await Startup.create(req.body);
    console.log(req.user.name);

    res.status(201).json({
        success: true,
        msg: 'Create new startup...',
        data: startup
    });
});

// @desc    Update startup
// @oute    PUT /api/v1/Startups/:id
// @access  Private
exports.updateStartup = asyncHandler(async(req, res, next) => {
    const startup = await Startup.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });
    if (!startup)
        return next(new ErrorResponse(`Startup not found with id of ${req.params.id}`), 404);
    res.status(200).json({ succes: true, ddata: startup });
});


// @desc    Delete startup
// @oute    DELETE /api/v1/Startups/:id
// @access  Private
exports.deleteStartup = asyncHandler(async(req, res, next) => {
    const startup = await Startup.findById(req.params.id);
    if (!startup)
        return next(
            new ErrorResponse(`Startup not found with id of ${req.params.id}`),
            404);
    startup.remove();
    res.status(200).json({ success: true, data: {} });
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
        console.log(`${place.countryCode} ===> ${i}`);
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



// @desc    Upload startup
// @oute    PUT /api/v1/Startups/:id/photo
// @access  Private
exports.StartupPhotoUpload = asyncHandler(async(req, res, next) => {
    const startup = await Startup.findById(req.params.id);
    if (!startup)
        return next(
            new ErrorResponse(`Startup not found with id of ${req.params.id}`),
            404);
    if (!req.files) {
        return (next(new ErrorResponse(`Please upload a file`, 400)));
    }

    const file = req.files.file;

    // Make sure the image is a photo
    if (!file.mimetype.startsWith('image')) {
        return (next(new ErrorResponse(`Please upload an image file`, 400)));
    }

    // Check filesize
    if (file.size > process.env.MAX_FILE_UPLOAD) {
        return (next(new ErrorResponse(`Please upload an image less than ${process.env.MAX_FILE_UPLOAD}`, 400)));
    }
    // Create custom filename
    file.name = `photo_${startup._id}${path.parse(file.name).ext}`;

    file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async err => {
        if (err) {
            console.error(err);
            return (next(new ErrorResponse(`Problem with file upload`, 500)));
        }

        await Startup.findByIdAndUpdate(req.params.id, { photo: file.name });
        res.status(200).json({
            success: true,
            data: file.name
        });
    });

    console.log(file.name);
});