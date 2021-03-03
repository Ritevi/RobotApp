const { AuthService } = require('../../libs/Auth');

module.exports = async function vkAuth(req, res, next) {
  try {
    const [fingerprint, ua] = req.query.state.split('.ua.');
    const pairOfTokens = await AuthService.generatePairOftokens({
      fingerprint,
      ua,
      userData: {
        userId: req.user.id,
      },
    });
    res.json({ ...pairOfTokens });
  } catch (err) {
    next(err);
  }
};
