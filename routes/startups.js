const express = require('express');
const {
    getStartups,
    getStartup,
    createStartup,
    updateStartup,
    deleteStartup
} = require('../controllers/startups');

const router = express.Router();

router.route('/')
    .get(getStartups)
    .post(createStartup);

router.route('/:id')
    .get(getStartup)
    .put(updateStartup)
    .delete(deleteStartup);

module.exports = router;