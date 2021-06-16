const Course = require('../models/Course');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../midlleware/async');

// @desc    Get courses
// @route   GET /api/v1/courses
// @route   GET /api/1/courses/:startupId/course
//@access   Public
exports.getCourses = asyncHandler(async(req, res, next) => {
    let query;

    if (req.params.startupId) {
        query = Course.find({
            Startup: req.params.startupId
        });
    } else {
        query = Course.find();
    }

    const courses = await query;


    res.status(200).json({
        success: true,
        count: courses.length,
        data: courses
    });
});