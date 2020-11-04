const Robot = require("../../models/Robot").Robot;
const User= require("../../models/User").User;
const jwt = require("jsonwebtoken");

class RobotService {

    static async addRobotToUser(userId,robotUuid){
        try{
            let user = await User.findByPk(userId);
            let robot = await Robot.findAll({where:{ //todo dont create
                    uuid:robotUuid
                }});
            if(!robot) throw new Error("no robot");
            await user.addRobot(robot.id);
            return user.getJSON();
        } catch (err){
            throw err;
        }

    }


    static async userHasRobot(userId,robotUuid){
        try{
            let robot = await Robot.findAll({where:{
                uuid:robotUuid
                }})
            return robot.hasUser(userId);
        } catch (err){

        }
    }
}


module.exports = RobotService;