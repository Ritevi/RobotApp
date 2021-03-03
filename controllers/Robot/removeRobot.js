const RobotService = require('../../libs/Robot');

module.exports = async (req, res, next) => {
  try {
    const { userId } = req.body.userData;
    const robotId = req.params.id;
    const robots = await RobotService.removeRobot(userId, robotId);
    res.json({
      message: {
        userId,
        robots,
      },
    });
  } catch (err) {
    next(err);
  }
};
