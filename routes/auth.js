const express = require('express');
const { register, login, getMe, forgotPassword, resetPassword, updateDetails, updatePassword, check } = require('../controllers/auth');

const router = express.Router();

const { protect } = require('../midlleware/auth');

router.post('/register', register);
router.post('/check', check);
router.post('/login', login);
router.get('/me', protect, getMe);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:resettoken', resetPassword);
router.put('/updatedetails', protect, updateDetails);
router.put('/updatepassword', protect, updatePassword);


module.exports = router;