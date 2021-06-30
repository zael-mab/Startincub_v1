const express = require('express');
const { getCourses, getCourse, addCourse, updateCourse, deleteCourse } = require('../controllers/courses');

const Course = require('../models/Course');
const advencedResults = require('../midlleware/advencedResults');

const router = express.Router({ mergeParams: true });

const { protect, authorize } = require('../midlleware/auth');

router
    .route('/')
    .get(advencedResults(Course, {
        path: 'startup',
        select: 'name description'
    }), getCourses)
    .post(protect, authorize('user', 'admin'), addCourse);

router
    .route('/:id')
    .get(getCourse)
    .put(protect, authorize('user', 'admin'), updateCourse)
    .delete(protect, authorize('user', 'admin'), deleteCourse);

module.exports = router;