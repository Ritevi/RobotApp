const RobotService = require('../../libs/Robot');

module.exports = async (req, res, next) => {
  try {
    const { userId } = req.body.userData;
    const { robotId } = req.body;
    await RobotService.addRobotToUser(userId, robotId);
    res.json({
      message: {
        userId,
        robotId,
      },
    });
  } catch (err) {
    next(err);
  }
};
