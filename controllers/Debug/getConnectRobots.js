module.exports =async (req,res,next)=>{
    try{
        let onlineRobot = [];
        for (const robot of req.app.get("robotMap").keys()) {
            onlineRobot.push(robot);
        }
        res.json({message:"online robots",robots:onlineRobot})
    } catch (err){
        next(err);
    }
}