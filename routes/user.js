const express = require('express');
const { model } = require('mongoose');
const router = express.Router();
const wrapasync = require('../utils/wrapasync.js');
const passport = require('passport');
const User = require('../models/user');

router.get('/signup', (req, res) => {
    res.render('users/signup.ejs');
});


router.post('/signup', async (req, res, next) => {
    try {
        let { username, email, password } = req.body;
        const newuser = new User({ username, email });
        await User.register(newuser, password);
        req.flash('success', 'Welcome to WanderLust!');
    } catch (e) {
        req.flash('error', e.message);
        return res.redirect('/signup');
    }
});



router.get('/login', (req, res) => {
    res.render('users/login.ejs');
});
router.post('/login', passport.authenticate('local', {
    failureFlash: true,
    failureRedirect: '/login'
}), (req, res) => {
    req.flash('success', 'Welcome back! you have successfully logged in.');
    res.redirect('/listings');
});

module.exports = router;