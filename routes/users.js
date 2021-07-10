const express = require('express');
const { getUser, getUsers, createUser, updateUser, deleteUser, getStartupsToRate } = require('../controllers/users');

const router = express.Router({ mergeParams: true });
const User = require('../models/User');
const advencedResults = require('../midlleware/advencedResults');
const { protect, authorize } = require('../midlleware/auth');


router.use(protect);
// router.use(authorize('admin'));

router
    .route('/')
    .get(advencedResults(User), getUsers)
    // .get(getStartupsToRate)
    .post(createUser);

router
    .route('/startups')
    .get(getStartupsToRate);

router.route('/:id')
    .get(getUser)
    .put(updateUser)
    .delete(deleteUser);

module.exports = router;