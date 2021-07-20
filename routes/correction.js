const express = require('express');
const Users = require('../models/User');
const Startups = require('../models/Startups');
const { getStartupsToRate, evaluatStartup, addCorrectionForMentor } = require('../controllers/correction');

const router = express.Router({ mergeParams: true });
const advencedResults = require('../midlleware/advencedResults');
const { protect, authorize } = require('../midlleware/auth');
const { getStartups } = require('../controllers/startups');

router.use(protect);
// router.use(authorize('admin'));

router.route('/')
    .get(authorize('mentor'), getStartupsToRate);

router.route('/:id')
    .put(authorize('mentor'), evaluatStartup);

router.route('/:id/:startup')
    .post(authorize('admin'), addCorrectionForMentor);

module.exports = router;