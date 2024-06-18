const express = require('express');
const passport = require('passport');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const User = require('../models/user');
const { storeReturnTo } = require('../middleware');
const users = require('../controllers/users');

//REGISTER ROUTE
router.get('/register', users.renderRegister);

router.post('/register', catchAsync(users.register));

//LOGIN ROUTE
router.get('/login', users.renderLogin)

router.post('/login', storeReturnTo, passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), users.login);

//LOGOUT ROUTES
router.get('/logout', users.logout);

module.exports = router;

