const passport = require('passport');
const OAuth2Strategy = require('passport-oauth2');
const axios = require('axios');
const { User } = require('../../models/User');

passport.use('vk-oauth2', new OAuth2Strategy({
  authorizationURL: 'https://oauth.vk.com/authorize',
  tokenURL: 'https://oauth.vk.com/access_token',
  clientID: '7356234',
  clientSecret: 'DeuhgWF1SMKKRYipvXfd', // todo rewrite this hardcode
  callbackURL: 'http://localhost:3000/auth/example/callback',
},
((accessToken, refreshToken, params, profile, done) => {
  axios.post(`https://api.vk.com/method/users.get?user_id=${params.user_id}&v=5.52&access_token=${accessToken}`)
    .then((res) => res.data.response[0])
    .then(async (prof) => {
      // todo move this to AuthService
      const [user] = await User.findOrCreate({
        where: {
        },
        defaults: { // todo findOrCreate
          profileType: 'vkData',
        },
        include: [{
          association: User.associations.vkData,
          as: 'vkData',
          where: {
            uuid: prof.id.toString(),
          },
          defaults: {
            uuid: prof.id,
            first_name: prof.first_name,
            second_name: prof.last_name,
          },
        }],
      });
      done(null, user.toJSON());
    });
})));

module.exports = passport;
