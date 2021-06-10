const Startup = require('../models/Startups');
const ErrorResponse = require('../utils/errorResponse')
    // @desc    Get all startups
    // @oute    GET /api/v1/Startups
    // @access  Public
exports.getStartups = async(req, res, next) => {
    try {
        const startups = await Startup.find();

        res.status(200).json({ success: true, count: startups.length, data: startups });
    } catch (err) {
        res.status(400).json({ success: false });

        console.log(`${err}`.red);
        // next(new ErrorResponse(`Startup `));
    }
}

// @desc    Get single startup
// @oute    GET /api/v1/Startups/:id
// @access  Private
exports.getStartup = async(req, res, next) => {
    try {
        const startup = await Startup.findById(req.params.id);

        if (!startup) {
            return next(new ErrorResponse(`Startup not found with id of ${req.params.id}`), 404);
            // return res.status(400).json({ success: false });
        }

        res.status(200).json({ success: true, data: startup });
    } catch (err) {
        // res.status(400).json({ success: false, msg: err.message })

        // console.log(`${err}`.red);
        next(new ErrorResponse(`Startup not found with id of ${req.params.id}`), 404);
    }
}

// @desc    Create new startup
// @oute    POST /api/v1/Startups/
// @access  Private
exports.createStartup = async(req, res, next) => {
    try {
        const startup = await Startup.create(req.body);

        res.status(201).json({
            success: true,
            msg: 'Create new startup...',
            data: startup
        });
    } catch (err) {
        // res.status(400).json({ success: false });
        // console.log(`${err}`.red);
        next(err);
    }
}

// @desc    Update startup
// @oute    PUT /api/v1/Startups/:id
// @access  Private
exports.updateStartup = async(req, res, next) => {
    try {
        const startup = await Startup.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        if (!startup)
            return res.status(400).json({ success: false });
        res.status(200).json({ succes: true, ddata: startup });
    } catch (err) {
        // console.log(`${err}`.red);
        // res.status(400).json({ success: false });
        next(err);
    }
}


// @desc    Delete startup
// @oute    DELETE /api/v1/Startups/:id
// @access  Private
exports.deleteStartup = async(req, res, next) => {
    try {
        const startup = await Startup.findByIdAndDelete(req.params.id);
        if (!startup)
            return res.status(400).json({ success: false });
        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        // res.status(400).json({ success: false });
        next(err);
    }
}