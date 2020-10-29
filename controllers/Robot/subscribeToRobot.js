const RobotService = require("../../libs/Robot");
const AuthService = require("../../libs/Auth");

module.exports =async (req,res,next)=>{
    try{
        const accessToken = req.headers["authorization"].split(" ")[1];
        if(!await AuthService.verifyAccessToken(accessToken)) res.json({message:"accesToken error"});

        const decodedToken = await AuthService.decodeToken(accessToken);
        let robotId = req.body.robotId;
        await RobotService.addRobotToUser(decodedToken.userId,robotId);
        res.json({message:"okey"});
    } catch (err){
        next(err);
    }
}