const express = require('express');
const {
    getStartups,
    getStartup,
    createStartup,
    updateStartup,
    deleteStartup,
    getStartupsInRadius
} = require('../controllers/startups');

const router = express.Router();

router.route('/redius/:zipcode/:distance').get(getStartupsInRadius);

router.route('/')
    .get(getStartups)
    .post(createStartup);

router.route('/:id')
    .get(getStartup)
    .put(updateStartup)
    .delete(deleteStartup);

module.exports = router;