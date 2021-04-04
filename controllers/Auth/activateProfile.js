module.exports = (AuthService) => async (req, res, next) => {
  try {
    const emailUUID = req.params.UUID;
    const status = await AuthService.activateLocalProfile({ emailUUID });
    res.json({ message: 'user status', status });
  } catch (err) {
    next(err);
  }
};
