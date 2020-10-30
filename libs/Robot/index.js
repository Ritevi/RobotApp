const config = require('../../config');
let redisClient = new (require('../redis'))(config.get('redis'));
const Robot = require("../../models/Robot").Robot;
const User= require("../../models/User").User;
const jwt = require("jsonwebtoken");

class RobotService {
    static robotCollection = "robotToUser"
    static async SubscribeToRobot(userId, robotId){
        //todo verify that user has this robot
        //todo make jwt token with user and robot info, mb not uuid but just id of robot
        redisClient.setAsync(this.getRobotPath(userId),robotId);
    }

    static async getRobot(userId){
        return redisClient.getAsync(this.getRobotPath(userId));
    }

    static getRobotPath(userId){
        return this.robotCollection+redisClient.separator+userId;
    }

    static async addRobotToUser(userId,robotId){
        try{
            let user = await User.findByPk(userId);
            let robot = await Robot.findOrCreate({where:{
                    uuid:robotId
                }});
            await user.addRobot(robot.id);
            return user.getJSON();
        } catch (err){
            throw err;
        }

    }
}


module.exports = RobotService;