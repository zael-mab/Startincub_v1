const express = require('express');
const Users = require('../models/User');
const Startups = require('../models/Startups');
const {
    getStartupsToRate,
    evaluatStartup,
    addCorrectionToMentor,
    deleteStartupFromMentor,
    getStartupToRate,
    clearMentor
} = require('../controllers/correction');

const router = express.Router({ mergeParams: true });
const advencedResults = require('../midlleware/advencedResults');
const { protect, authorize } = require('../midlleware/auth');
const { getStartups } = require('../controllers/startups');

router.use(protect);
// router.use(authorize('admin'));

router.route('/')
    .get(authorize('mentor', 'admin'), getStartupsToRate);

router.route('/:id')
    .get(authorize('mentor', 'admin'), getStartupToRate)
    .put(authorize('mentor'), evaluatStartup)
    .delete(authorize('admin'), clearMentor);

router.route('/:id/:startupid')
    .post(authorize('admin'), addCorrectionToMentor)
    .delete(authorize('admin'), deleteStartupFromMentor);

module.exports = router;