let joi = require("joi")

module.exports =async (req,res,next)=>{
    try{
        await RegisterSchema.validateAsync(req.body)
        next()
    } catch (err){
        next(err);
    }
}


let RegisterSchema = joi.object({
    username:joi.string().required(),
    password:joi.string().required(),
    email:joi.string().required().email()
})