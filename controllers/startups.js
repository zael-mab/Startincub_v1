const Startup = require('../models/Startups');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../midlleware/async');
const geocoder = require('../utils/geocoder');
const path = require('path');

// @desc    Get all startups
// @oute    GET /api/v1/Startups
// @access  Public
exports.getStartups = asyncHandler(async(req, res, next) => {
    let query;

    //  Copy req.query
    const reqQuery = {...req.query };

    // Fields to exlude
    const removeFields = ['select', 'sort', 'page', 'limit'];

    // Lopp over removeField and delete them from reqQuery
    removeFields.forEach(param => delete reqQuery[param]);

    // console.log(reqQuery);
    // Create query string
    let queryStr = JSON.stringify(reqQuery);

    //  Create operators ($gt, $gte, etc )
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

    //  Finding resource 
    query = Startup.find(JSON.parse(queryStr)).populate('courses');

    // Select fields
    if (req.query.select) {
        const fields = req.query.select.split(',').join(' ');
        query = query.select(fields);
    }

    // Sort 
    if (req.query.sort) {
        const sortBy = req.query.sort.split(',').join(' ');
        query = query.sort(sortBy);
    } else {

        // *** if theres a startups that have the same create date the pages have a problem in listing ***
        query = query.sort('-createdAt');
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 25;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Startup.countDocuments();

    query = query.skip(startIndex).limit(limit);

    // Executing query
    const startups = await query;
    // Pagination result
    const pagination = {};

    if (endIndex < total) {
        pagination.next = {
            page: page + 1,
            limit
        };
    }

    if (startIndex > 0) {
        pagination.prev = {
            page: page - 1,
            limit
        };
    }


    res.status(200).json({ success: true, count: startups.length, pagination, data: startups });
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