module.exports = (AuthService) => async function vkAuth(req, res, next) {
  try {
    if (!req.user) throw new Error('no vk user');
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
