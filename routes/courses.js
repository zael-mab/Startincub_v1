const express = require('express');
const { getCourses, getCourse, addCourse, updateCourse, deleteCourse } = require('../controllers/courses');

const Course = require('../models/Course');
const advencedResults = require('../midlleware/advencedResults');

const router = express.Router({ mergeParams: true });

router
    .route('/')
    .get(advencedResults(Course, {
        path: 'startup',
        select: 'name description'
    }), getCourses)
    .post(addCourse);

router
    .route('/:id')
    .get(getCourse)
    .put(updateCourse)
    .delete(deleteCourse);

module.exports = router;