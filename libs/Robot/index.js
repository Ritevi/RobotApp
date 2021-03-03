const { Robot } = require('../../models/Robot');
const { User } = require('../../models/User');

class RobotService {
  static async addRobotToUser(userId, robotUuid) {
    const user = await User.findByPk(userId);
    const [robot] = await Robot.findOrCreate({
      where: { // todo dont create
        uuid: robotUuid,
      },
    });
    if (!robot) throw new Error('no robot');
    await user.addRobot(robot.id);
    return user.getJSON();
  }

  static async userHasRobot(userId, robotUuid) {
    const robot = await Robot.findAll({
      where: {
        uuid: robotUuid,
      },
    });
    return robot.hasUser(userId);
  }

  static async getRobots(userId): Promise<Array> {
    const user = await User.findByPk(userId);
    const robots = await user.getRobot().then((robotMap) => robotMap.map((robot) => ({
      id: robot.id,
      uuid: robot.uuid,
    })));
    return robots;
  }

  static async removeRobot(userId, robotUuid) {
    const user = await User.findByPk(userId);
    const robot = await Robot.findAll({
      where: {
        uuid: robotUuid,
      },
    });
    await user.removeRobot(robot);
    const robots = await this.getRobots(userId);
    return robots;
  }
}

module.exports = RobotService;
