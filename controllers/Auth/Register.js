module.exports = (AuthService, EmailService) => async (req, res, next) => {
  try {
    const user = await AuthService.register(req.body);
    await EmailService.registerEmail(req.body.email);
    res.json(user);
  } catch (err) {
    next(err);
  }
};
