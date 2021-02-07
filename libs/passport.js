const passport = require('passport')
const OAuth2Strategy = require('passport-oauth2');
const axios = require('axios');
const User = require('../models/User').User;
const VkData = require("../models/AuthData/VkData");
const Sequelize = require("sequelize");

passport.use("vk-oauth2",new OAuth2Strategy({
        authorizationURL: 'https://oauth.vk.com/authorize',
        tokenURL: 'https://oauth.vk.com/access_token',
        clientID: "7356234",
        clientSecret: "DeuhgWF1SMKKRYipvXfd",
        callbackURL: "http://localhost:3000/auth/example/callback"
    },
    function(accessToken, refreshToken, params, profile, done) {
        axios.post(`https://api.vk.com/method/users.get?user_id=${params.user_id}&v=5.52&access_token=${accessToken}`)
            .then(res=>res.data)
            .then((prof)=>{
                console.log(prof);
                let uid = parseInt(prof.response[0].id);
                console.log(typeof uid)
                User.findAll({
                    include:[{model:VkData,
                    where:{uid:Sequelize.INTEGER(uid)}
                                    }]
            }).then((user)=>{
                if(!user) return User.Create({username:"username"+Math.rand()*1000000})
                else return done(null,user)
            }).then((user)=>{
                VkData.Create
            }).catch(err=>{
                console.log(err)
            })

            }
        );

    }
));

module.exports = passport;