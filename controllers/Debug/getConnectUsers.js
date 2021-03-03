module.exports = async (req, res, next) => {
  try {
    const onlineUser = [];
    req.app.get('userMap').keys().forEach((user) => {
      onlineUser.push(user);
    });
    res.json({ message: 'online users', users: onlineUser });
  } catch (err) {
    next(err);
  }
};
