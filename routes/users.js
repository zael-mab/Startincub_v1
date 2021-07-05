const express = require('express');
const { getUser, getUsers, createUser, updateUser, deleteUser } = require('../controllers/users');

const router = express.Router({ mergeParams: true });
const User = require('../models/User');
const advencedResults = require('../midlleware/advencedResults');
const { protect, authorize } = require('../midlleware/auth');


router.use(protect);
router.use(authorize('admin'));

router
    .route('/')
    .get(advencedResults(User), getUsers)
    .post(createUser);

router.route('/:id')
    .get(getUser)
    .put(updateUser)
    .delete(deleteUser);

module.exports = router;