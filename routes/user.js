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
        req.login(newuser, (err) => {
            if (err) return next(err);
            req.flash('success', 'Welcome to WanderLust!');
            res.redirect('/listings');
        });
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
    let redirecturl = req.session.redirecturl || '/listings';
    res.redirect(redirecturl);
});




router.get('/logout', (req, res , next) => {
    req.logout((err) => {
        if (err) { return next(err); }
        req.flash('success', 'You have logged out!');
        res.redirect('/listings');
    });
});

module.exports = router;