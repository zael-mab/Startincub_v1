// @desc    Get all startups
// @oute    GET /api/v1/Startups
// @access  Public
exports.getStartups = (req, res, next) => {
    res.status(200).json({
        success: true,
        msg: 'show all startups...'
    });
}

// @desc    Get single startup
// @oute    GET /api/v1/Startups/:id
// @access  Private
exports.getStartup = (req, res, next) => {
    res.status(200).json({
        success: true,
        msg: `show a single startup: ${req.params.id}...`
    });
}

// @desc    Create new startup
// @oute    POST /api/v1/Startups/
// @access  Private
exports.createStartup = (req, res, next) => {
    res.status(200).json({
        success: true,
        msg: 'Create new startup...'
    });
}

// @desc    Update startup
// @oute    PUT /api/v1/Startups/:id
// @access  Private
exports.updateStartup = (req, res, next) => {
    res.status(200).json({
        success: true,
        msg: `Update a startup ${req.params.id}...`
    });
}


// @desc    Delete startup
// @oute    DELETE /api/v1/Startups/:id
// @access  Private
exports.deleteStartup = (req, res, next) => {
    res.status(200).json({
        success: true,
        msg: `Delete startup ${req.params.id}...`
    });
}