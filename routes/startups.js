const express = require('express');
const {
    getStartups,
    getStartup,
    createStartup,
    updateStartup,
    deleteStartup,
    getStartupsInRadius,
    StartupPhotoUpload
} = require('../controllers/startups');


const Startup = require('../models/Startups');
const advencedResults = require('../midlleware/advencedResults');

// Include other resource routers
const courseRouter = require('./courses');

const router = express.Router();

const { protect } = require('../midlleware/auth');
// Re-route into other resourse routers
router.use('/:startupId/courses', courseRouter);

router.route('/redius/:zipcode/:distance').get(getStartupsInRadius);

router.route('/:id/photo').put(protect, StartupPhotoUpload);

router.route('/')
    .get(advencedResults(Startup, 'courses'), getStartups)
    .post(protect, createStartup);

router.route('/:id')
    .get(getStartup)
    .put(protect, updateStartup)
    .delete(protect, deleteStartup);

module.exports = router;