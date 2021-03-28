const express = require('express');

const router = express.Router();
const { passport } = require('../libs/passport');
const vkAuth = require('../controllers/Auth/vkAuth');

router.get('/', (req, res) => {
  res.render('index');
});

router.get('/auth/example', (req, res, next) => {
  passport.authenticate('vk-oauth2', { state: `${req.query.fingerprint}.ua.${req.headers['user-agent']}` })(req, res, next);
});

router.get('/auth/example/callback',
  passport.authenticate('vk-oauth2', { session: false }), vkAuth);
module.exports = router;
