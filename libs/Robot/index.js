const Robot = require("../../models/Robot").Robot;
const User= require("../../models/User").User;
const jwt = require("jsonwebtoken");

class RobotService {

    static async addRobotToUser(userId,robotUuid){
        try{
            let user = await User.findByPk(userId);
            let [robot,created] = await Robot.findOrCreate({where:{ //todo dont create
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

    static async getRobots(userId){
        try{
            let user = await User.findByPk(userId);
            let robots =await user.getRobot().then((robots)=>{
                return robots.map((robot)=>{
                    return {id:robot.id,
                    uuid:robot.uuid};
                })
            })
            return robots;
        } catch (err){
            throw err;
        }
    }


    static async removeRobot(userId,robotUuid){
        try{
            let user = await User.findByPk(userId);
            let robot= await Robot.findAll({where:{ //todo dont create
                    uuid:robotUuid
                }});
            await user.removeRobot(robot);
            let robots =await this.getRobots(userId);
            return robots;
        } catch (err){
            throw err;
        }
    }
}


module.exports = RobotService;