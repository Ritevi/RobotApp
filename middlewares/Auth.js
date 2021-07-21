module.exports = (AccessStorage) => async (req, res, next) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const verify = await AccessStorage.verifyToken(token);
    if (verify) {
      req.body.userData = await AccessStorage.decodeToken(token);
      next();
    } else {
      res.json({ message: 'please login' });
    }
  } catch (err) {
    res.status(400).json({ message: 'token error', err });
  }
};
