let joi = require("joi")

module.exports =async (req,res,next)=>{
    try{
        await RefreshHeaderSchema.validateAsync({accessToken:req.headers["authorization"],ua:req.headers["user-agent"]});
        await RefreshSchema.validateAsync(req.body)
        next()
    } catch (err){
        next(err);
    }
}


let RefreshSchema = joi.object({
    refreshToken:joi.string().required(),
    fingerprint:joi.string().required(),
})

let RefreshHeaderSchema = joi.object({
    ua:joi.string().required(),
    accessToken:joi.string().required()
})