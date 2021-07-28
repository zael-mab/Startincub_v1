const express = require('express');
const {
    getStartups,
    getStartup,
    createStartup,
    updateStartup,
    deleteStartup,
    getStartupsInRadius,
    StartupPhotoUpload,
    sendPhoto,
    check
} = require('../controllers/startups');


const Startup = require('../models/Startups');
const advencedResults = require('../midlleware/advencedResults');

// Include other resource routers
const courseRouter = require('./courses');

const router = express.Router();

const { protect, authorize } = require('../midlleware/auth');
// Re-route into other resourse routers
// router.use('/:startupId/courses', courseRouter);


router.route('/photo/:photoid')
    .get(sendPhoto);

router.route('/check')
    .post(check);

router.route('/redius/:zipcode/:distance').get(getStartupsInRadius);

router.route('/:id/photo')
    .put(protect, authorize('user', 'admin'), StartupPhotoUpload);

router.route('/')
    .get(advencedResults(Startup, { path: 'user', select: 'firstname lastname email' }), getStartups)
    .post(protect, authorize('user', 'admin'), createStartup);

router.route('/:id')
    .get(getStartup)
    .put(protect, authorize('user', 'admin'), updateStartup)
    .delete(protect, authorize('user', 'admin'), deleteStartup);

module.exports = router;