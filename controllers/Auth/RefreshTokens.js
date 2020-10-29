const AuthService = require("../../libs/Auth");

module.exports =async (req,res,next)=>{
    try{
        const accessToken = req.headers["authorization"].split(" ")[1];
        const ua = req.headers["user-agent"];
        const {refreshToken,fingerprint} = req.body;
        const pairOfTokens = await AuthService.refreshAccessToken({accessToken,ua,refreshToken,fingerprint});
        res.json(pairOfTokens);
    } catch (err){
        next(err);
    }
}