const { Robot } = require('../../models/Robot');
const { User } = require('../../models/User');
const RobotError = require('./RobotError');

class RobotService {
  static async addRobotToUser(userId, robotUuid) {
    const user = await User.findByPk(userId);
    const [robot] = await Robot.findOrCreate({
      where: {
        uuid: robotUuid,
      },
    });
    if (!robot) throw new Error('no robot');
    await user.addRobot(robot.id);
    if (await user.hasRobot(robot.id)) {
      return { id: robot.id };
    }
    throw new RobotError('ROBOT', 'ROBOTADD', 'robot not add');
  }

  static async userHasRobot(userId, robotUuid) {
    const user = await User.findByPk(userId);
    return user.hasRobot(robotUuid);
  }

  static async getRobots(userId) {
    const user = await User.findByPk(userId);
    const robots = await user.getRobot().then((robotMap) => robotMap.map((robot) => ({
      id: robot.id,
    })));
    return robots;
  }

  static async removeRobot(userId, robotId) {
    const user = await User.findByPk(userId);
    const robot = await Robot.findAll({
      where: {
        id: robotId,
      },
    });
    await user.removeRobot(robot);
    if (!await this.userHasRobot(userId, robotId)) {
      return {
        robotId: Number(robotId),
      };
    }
    throw new RobotError('ROBOT', 'ROBOTREMOVE', 'robot still exist');
  }
}

module.exports = RobotService;
