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
router.use(protect);

router.route('/check')
    .post(authorize('admin'), check);

router.route('/redius/:zipcode/:distance').get(getStartupsInRadius);

router.route('/:id/photo')
    .put(authorize('user', 'admin'), StartupPhotoUpload);

router.route('/')
    .get(advencedResults(Startup, { path: 'user', select: 'firstname lastname email' }), authorize('admin'), getStartups)
    .post(authorize('user', 'admin'), createStartup);

router.route('/:id')
    .get(authorize('admin'), getStartup)
    .put(authorize('admin'), updateStartup)
    .delete(authorize('user', 'admin'), deleteStartup);

module.exports = router;