module.exports = (AuthService) => async (req, res, next) => {
  try {
    const emailUUID = req.params.emailUUID;
    const status = await AuthService.activateLocalProfile({ emailUUID });
    res.json({ message: 'user status', status });
  } catch (err) {
    next(err);
  }
};
