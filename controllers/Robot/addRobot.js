const RobotService = require('../../libs/Robot');

module.exports = async (req, res, next) => {
  try {
    const { userId } = req.body.userData;
    const { robotId } = req.body;
    const robot = await RobotService.addRobotToUser(userId, robotId); // todo why dont return value
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
