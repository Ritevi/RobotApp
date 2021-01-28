const RobotService = require("../../libs/Robot");

module.exports =async (req,res,next)=>{
    try{
        const userId = req.body.userData.userId;
        let robots = await RobotService.getRobots(userId);
        let onlineRobots = [];
        for (const robot of robots) {
            if(req.app.get("robotMap").has(robot.uuid))
            {
                onlineRobots.push(robot);
            }
        }
        res.json({message:"online robots",robots:onlineRobots})
    } catch (err){
        next(err);
    }
}