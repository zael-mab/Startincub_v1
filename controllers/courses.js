const Course = require('../models/Course');
const Startup = require('../models/Startups');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../midlleware/async');

// @desc    Get courses
// @route   GET /api/v1/courses
// @route   GET /api/v1/startups/:startupId/course
//@access   Public
exports.getCourses = asyncHandler(async(req, res, next) => {

    if (req.params.startupId) {
        const courses = await Course.find({
            startup: req.params.startupId
        });
        return res.status(200).json({
            success: true,
            count: courses.length,
            data: courses
        });
    } else {
        res.status(200).json(res.advencedResults);
    }

});


// @desc    Get course
// @route   GET /api/v1/courses/:id
//@access   Public
exports.getCourse = asyncHandler(async(req, res, next) => {
    const course = await Course.findById(req.params.id).populate({
        path: 'startup',
        select: 'name description'
    });

    if (!course) {
        return (next(new ErrorResponse(`No course with the id of ${req.params.id}`), 404));
    }

    res.status(200).json({
        success: true,
        data: course
    });
});

// @desc    Add courses
// @route   POST /api/v1/startups/:startupId/courses
//@access   Private
exports.addCourse = asyncHandler(async(req, res, next) => {
    req.body.startup = req.params.startupId;
    req.body.user = req.user.id;

    const startup = await Startup.findById(req.params.startupId);

    if (!startup) {
        return (next(new ErrorResponse(`No startup with the id of ${req.params.startupId}`), 404));
    }

    // Make sure user Startup owner
    if (startup.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new ErrorResponse(`the user ${req.user.id} is not allowed to create Courses`, 401));
    }

    const course = await Course.create(req.body);

    res.status(200).json({
        success: true,
        data: course
    });
});


// @desc    Update courses
// @route   PUT /api/v1/courses/:id
//@access   Private
exports.updateCourse = asyncHandler(async(req, res, next) => {
    let course = await Course.findById(req.params.id);

    if (!course) {
        return (next(new ErrorResponse(`No course with the id of ${req.params.id}`), 404));
    }

    if (course.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new ErrorResponse(`the user ${req.user.id} is not allowed to Update this Course`, 401));
    }

    course = await Course.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    res.status(200).json({
        success: true,
        data: course
    });
});


// @desc    Delete courses
// @route   DELETE /api/v1/courses/:id
//@access   Private
exports.deleteCourse = asyncHandler(async(req, res, next) => {
    let course = await Course.findById(req.params.id);
    console.log(req.params.id);
    if (!course) {
        return (next(new ErrorResponse(`No course with the id of ${req.params.id}`), 404));
    }


    if (course.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new ErrorResponse(`the user ${req.user.id} is not allowed to delete this Course`, 401));
    }

    await course.remove();

    res.status(200).json({
        success: true,
        data: []
    });
});