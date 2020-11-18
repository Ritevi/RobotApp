let joi = require("joi")

module.exports =async (req,res,next)=>{
    try{
        await loginSchema.validateAsync(req.body)
        next()
    } catch (err){
        next(err);
    }
}


let loginSchema = joi.object({
    username:joi.string().required(),
    password:joi.string().required(),
    fingerprint:joi.string().required(),
    ua:joi.string().required()
})