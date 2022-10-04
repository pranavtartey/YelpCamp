const express = require('express');
const router = express.Router();
const User = require('../models/user');
const passport = require('passport');
const catchAsync = require('../utils/catchAsync');
const users = require('../controllers/users');

router.get('/register',users.renderRegister)

router.route('/login')
    .get(users.renderLogin)
    .post(passport.authenticate('local',{failureFlash : true ,failureRedirect : '/login',keepSessionInfo : true}),users.login)
router.post('/register',catchAsync(users.register));

router.get('/logout',users.logout)

module.exports = router;