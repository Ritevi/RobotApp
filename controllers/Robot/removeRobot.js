const RobotService = require("../../libs/Robot");

module.exports =async (req,res,next)=>{
    try{
        const userId = req.body.userData.userId;
        let robotId = req.params.id;
        let robots = await RobotService.removeRobot(userId,robotId);
        res.json({message: {
                userId,
                robots:robots
            }});
    } catch (err){
        next(err);
    }
}