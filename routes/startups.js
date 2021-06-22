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

// Include other resource routers
const courseRouter = require('./courses');

const router = express.Router();

// Re-route into other resourse routers
router.use('/:startupId/courses', courseRouter);

router.route('/redius/:zipcode/:distance').get(getStartupsInRadius);

router.route('/:id/photo').put(StartupPhotoUpload);

router.route('/')
    .get(getStartups)
    .post(createStartup);

router.route('/:id')
    .get(getStartup)
    .put(updateStartup)
    .delete(deleteStartup);

module.exports = router;