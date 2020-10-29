const passport = require('passport')
const OAuth2Strategy = require('passport-oauth2');
const axios = require('axios');

passport.use(new OAuth2Strategy({
        authorizationURL: 'https://oauth.vk.com/authorize',
        tokenURL: 'https://oauth.vk.com/access_token',
        clientID: "7356234",
        clientSecret: "DeuhgWF1SMKKRYipvXfd",
        callbackURL: "http://localhost:3000/auth/example/callback"
    },
    function(accessToken, refreshToken, params, profile, done) {
        console.log(params);
        axios.post(`https://api.vk.com/method/users.get?user_id=${params.user_id}&v=5.52&access_token=${accessToken}`)
            .then(res=>res.data)
            .then((prof)=>{
                done(prof)
            }
        );

    }
));

module.exports = passport;