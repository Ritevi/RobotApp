const RobotService = require('../../libs/Robot');

module.exports = async (req, res, next) => {
  try {
    const { userId } = req.body.userData;
    const robotId = req.params.id;
    const robot = await RobotService.removeRobot(userId, robotId);
    res.json({
      message: {
        userId,
        ...robot,
      },
    });
  } catch (err) {
    next(err);
  }
};
