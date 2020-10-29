const AuthService = require("../../libs/Auth");

module.exports =async (req,res,next)=>{
    try{
        let user = await AuthService.register(req.body);
        res.json(user)
    } catch (err){
        next(err);
    }
}