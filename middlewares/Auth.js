const AuthService = require("../libs/Auth");

module.exports = async (req,res,next)=>{
    const token = req.authorization.split(" ")[1];
    const verify = await AuthService.verifyAccessToken(token);
    if(verify){
        next();
    } else {
        res.json({message:"please login"}); // todo change
    }
}