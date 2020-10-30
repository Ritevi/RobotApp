const RobotService = require("../../libs/Robot");
const AuthService = require("../../libs/Auth");

module.exports =async (req,res,next)=>{
    try{
        const userId = req.body.userData.userId;
        let robotId = req.body.robotId;
        await RobotService.addRobotToUser(userId,robotId);
        res.json({message:"okey"});
    } catch (err){
        next(err);
    }
}