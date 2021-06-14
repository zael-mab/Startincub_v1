const Startup = require('../models/Startups');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../midlleware/async');
const geocoder = require('../utils/geocoder');


// @desc    Get all startups
// @oute    GET /api/v1/Startups
// @access  Public
exports.getStartups = asyncHandler(async(req, res, next) => {

    const startups = await Startup.find();
    res.status(200).json({ success: true, count: startups.length, data: startups });
})

// @desc    Get single startup
// @oute    GET /api/v1/Startups/:id
// @access  Private
exports.getStartup = asyncHandler(async(req, res, next) => {
    const startup = await Startup.findById(req.params.id);

    if (!startup) {
        return next(new ErrorResponse(`Startup not found with id of ${req.params.id}`), 404);
    }

    res.status(200).json({ success: true, data: startup });
});

// @desc    Create new startup
// @oute    POST /api/v1/Startups/
// @access  Private
exports.createStartup = asyncHandler(async(req, res, next) => {
    const startup = await Startup.create(req.body);

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
    const startup = await Startup.findByIdAndDelete(req.params.id);
    if (!startup)
        return next(new ErrorResponse(`Startup not found with id of ${req.params.id}`), 404);
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