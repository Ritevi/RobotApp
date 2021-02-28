const AuthService = require("../../libs/Auth").AuthService


module.exports = async function (req,res,next){
    try {
        const [fingerprint, ua] = req.query.state.split(".ua.")
        let pairOfTOkens = await AuthService.generatePairOftokens({fingerprint, ua,userData:{
            userId:req.user.id
            }})
        res.json({...pairOfTOkens});
    }catch (err){
        next(err);
    }
}