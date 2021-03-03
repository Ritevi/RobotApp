module.exports = async (req, res, next) => {
  try {
    const userToRobot = Object.fromEntries(req.app.get('userToRobot').entries());
    res.json({ message: 'online connects', userToRobot });
  } catch (err) {
    next(err);
  }
};
