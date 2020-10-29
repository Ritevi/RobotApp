var express = require('express');
var router = express.Router();
var passport = require('../libs/passport');


router.get("/",(res,req)=>{
    res.render('index');
})

/* GET home page. */
router.get('/auth/example',
    passport.authenticate('oauth2'));

router.get('/auth/example/callback',
    passport.authenticate('oauth2', { failureRedirect: '/login',session:false }),
    function(req, res) {
      // Successful authentication, redirect home.
      res.redirect('/');
    });
module.exports = router;
