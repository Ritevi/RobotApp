var express = require('express');
var router = express.Router();
var {passport} = require('../libs/passport');


router.get("/",(res,req)=>{
    res.render('index');
})

router.get('/auth/example',
    passport.authenticate('vk-oauth2'));

router.get('/auth/example/callback',
    passport.authenticate('vk-oauth2', { session:false}),
    function(req, res) {
      res.json({message:"okey vk"});//todo change
    });
module.exports = router;
