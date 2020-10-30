const AuthService = require("../libs/Auth");

module.exports = async (req,res,next)=>{
    const token = req.headers["authorization"].split(" ")[1];
    const verify = await AuthService.verifyAccessToken(token);
    if(verify){
        let decodedToken = await AuthService.decodeToken(token);
        req.body.userData = decodedToken;
        next();
    } else {
        res.json({message:"please login"}); // todo change
    }
}