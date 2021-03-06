module.exports = (AuthService) => async (req, res, next) => {
  try {
    const user = await AuthService.register(req.body);
    res.json(user);
  } catch (err) {
    next(err);
  }
};
