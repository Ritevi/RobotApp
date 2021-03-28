const RobotService = require('../../libs/Robot');

module.exports = async (req, res, next) => {
  try {
    const { userId } = req.body.userData;
    const { robotUUID } = req.body;
    const robot = await RobotService.addRobotToUser(userId, robotUUID);
    res.json({
      message: {
        userId,
        robotId: robot.id,
      },
    });
  } catch (err) {
    next(err);
  }
};
