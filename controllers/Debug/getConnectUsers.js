module.exports =async (req,res,next)=>{
    try{
        let onlineUser = [];
        for (const user of req.app.get("userMap").keys()) {
            onlineUser.push(user);
        }
        res.json({message:"online users",users:onlineUser})
    } catch (err){
        next(err);
    }
}