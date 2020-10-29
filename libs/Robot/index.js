const config = require('../../config');
let redisClient = new (require('../redis'))(config.get('redis'));

class RobotService {
    static robotCollection = "robotToUser"
    static async addRobotToUser(userId,robotId){
        //todo verify that user has this robot
        redisClient.setAsync(this.getRobotPath(userId),robotId);
    }

    static async getRobot(userId){
        return redisClient.getAsync(this.getRobotPath(userId));
    }

    static getRobotPath(userId){
        return this.robotCollection+redisClient.separator+userId;
    }
}


module.exports = RobotService;