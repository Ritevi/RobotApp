const RobotService = require('../../libs/Robot');

module.exports = async (req, res, next) => {
  try {
    const { userId } = req.body.userData;
    const robots = await RobotService.getRobots(userId);
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
