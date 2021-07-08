const express = require('express');
const { getCourses, getCourse, addCourse, updateCourse, deleteCourse } = require('../controllers/courses');

const Course = require('../models/Course');
const advencedResults = require('../midlleware/advencedResults');

const router = express.Router({ mergeParams: true });

const { protect, authorize } = require('../midlleware/auth');

router
    .route('/')
    .get(advencedResults(Course), getCourses)
    .post(protect, authorize('admin'), addCourse);

router
    .route('/:id')
    .get(getCourse)
    .put(protect, authorize('admin'), updateCourse)
    .delete(protect, authorize('admin'), deleteCourse);

module.exports = router;