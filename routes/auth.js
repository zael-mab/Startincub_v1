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
    updatePhoto,
    sendPhoto,
    check
} = require('../controllers/auth');

const router = express.Router();

const advencedResults = require('../midlleware/advencedResults');
const Startup = require('../models/Startups');
const { protect } = require('../midlleware/auth');



router.route('/me')
    .get(protect, getMe);

router.route('/:photoid')
    .get(protect, sendPhoto);

router.route('/register')
    .post(register);
router.route('/check')
    .post(check);


router.route('/login')
    .post(advencedResults(Startup, { path: 'user', select: 'firstname lastname email' }), login);

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

router.route('/updatephoto')
    .put(protect, updatePhoto);


module.exports = router;