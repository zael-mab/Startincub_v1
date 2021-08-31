const express = require('express');
const {
    register,
    login,
    getMe,
    forgotPassword,
    resetPassword,
    updateDetails,
    updatePassword,
    logout,
    check
} = require('../controllers/auth');

const router = express.Router();

const advencedResults = require('../midlleware/advencedResults');
const Startup = require('../models/Startups');
const { protect } = require('../midlleware/auth');

router.route('/register')
    .post(register);
router.route('/check')
    .post(check);

router.route('/login')
    .post(advencedResults(Startup, { path: 'user', select: 'firstname lastname email' }), login);

router.route('/me')
    .get(protect, getMe);

router.route('/logout')
    .get(protect, logout);

router.route('/forgotpassword')
    .post(forgotPassword);

router.route('/resetpassword/:resettoken')
    .put(resetPassword);

router.route('/updatedetails')
    .put(protect, updateDetails);

router.route('/updatepassword')
    .put(protect, updatePassword);


module.exports = router;