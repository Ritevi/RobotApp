const RobotService = require("../../libs/Robot");

module.exports =async (req,res,next)=>{
    try{
        const userId = req.body.userData.userId;
        let robots = await RobotService.getRobots(userId);
        res.json({message: {
                userId,
                robots:robots
            }});
    } catch (err){
        next(err);
    }
}