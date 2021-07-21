module.exports = async (req, res, next) => {
  try {
    const onlineRobot = [];
    req.app.get('robotMap').keys().forEach((robot) => {
      onlineRobot.push(robot);
    });
    res.json({ message: 'online robots', robots: onlineRobot });
  } catch (err) {
    next(err);
  }
};
