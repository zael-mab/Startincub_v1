const Course = require('../models/Course');
const Startup = require('../models/Startups');
const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../midlleware/async');

// @desc    Get courses
// @route   GET /api/v1/courses
//@access   Public
exports.getCourses = asyncHandler(async(req, res, next) => {

    // if (req.params.userId) {
    //     const courses = await Course.find({
    //         user: req.params.userId
    //     });
    //     return res.status(200).json({
    //         success: true,
    //         count: courses.length,
    //         data: courses
    //     });
    // } else {
    res.status(200).json(res.advencedResults);
    // }

});


// @desc    Get course
// @route   GET /api/v1/courses/:id
//@access   Public
exports.getCourse = asyncHandler(async(req, res, next) => {
    // const course = await Course.findById(req.params.id).populate({
    //     path: 'user',
    //     select: 'name'
    // });

    const course = await Course.findById(req.params.id);

    if (!course) {
        return (next(new ErrorResponse(`No course with the id of ${req.params.id}`), 404));
    }

    res.status(200).json({
        success: true,
        data: course
    });
});

// @desc    Add courses
// @route   POST /api/v1/courses
//@access   Private
exports.addCourse = asyncHandler(async(req, res, next) => {
    const course = await Course.create(req.body);
    res.status(201).json({
        success: true,
        msg: 'Create new course...',
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

    await course.remove();

    res.status(200).json({
        success: true,
        data: []
    });
});