const AuthService = require("../libs/Auth");

module.exports = async (req,res,next)=>{
    try {
        const token = req.headers["authorization"].split(" ")[1];
        const verify = await AuthService.verifyAccessToken(token);
        if (verify) {
            let decodedToken = await AuthService.decodeToken(token);
            req.body.userData = decodedToken;
            next();
        } else {
            res.json({message: "please login"}); // todo change
        }
    }catch (err){
        //todo check type of error like TokenExpiredError and others, add return message
        res.json({message:"token error",err})
    }
}