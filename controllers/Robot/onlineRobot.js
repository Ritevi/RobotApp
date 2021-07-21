const RobotService = require('../../libs/Robot');

module.exports = async (req, res, next) => {
  try {
    const { userId } = req.body.userData;
    const robots = await RobotService.getRobots(userId);
    const onlineRobots = robots.filter((robot) => req.app.get('robotMap').has(robot.uuid));
    res.json({ message: 'online robots', robots: onlineRobots });
  } catch (err) {
    next(err);
  }
};
