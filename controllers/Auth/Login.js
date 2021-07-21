module.exports = (AuthService) => async (req, res, next) => {
  try {
    const ua = req.headers['user-agent'];
    const { fingerprint } = req.body;
    const pairOfTokens = await AuthService.login({ ...req.body, ua, fingerprint });
    res.json({ tokens: pairOfTokens });
  } catch (err) {
    next(err);
  }
};
