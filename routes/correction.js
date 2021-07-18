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
    .get(getStartupsToRate);

router.route('/:id/:startup')
    .put(authorize('admin'), addCorrectionForMentor);
module.exports = router;