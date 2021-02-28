let joi = require('joi');
let uuidv4 = require('uuid').v4;


//more test

//mb delete joi on delete,get, ?

//rewrite them 2
const refreshSchema = joi.object({
    userId:[joi.number().required(),joi.string().required()],
    expiresIn:joi.date().timestamp('unix').raw().required(),
    ua:joi.string().required().default(""), //todo check if this are checking
    fingerprint:joi.string().required().default(""),
})

const tokenSchema = joi.object({
    userId:[joi.number().required(),joi.string().required()],
    refreshToken:joi.string().uuid().required(),
    ua:joi.string().required().default(""),
    fingerprint:joi.string().required().default(""),
    expiresIn:joi.date().timestamp('unix').raw(),
    createdAt:joi.date().timestamp('unix').raw()
})


//think about get pair of access and refresh token in redis to verify, that this access token belongs to some refresh token
class refreshSession {
    constructor(storage,subscriber,sessionMaxCount = 5) {
        this.storage = storage;
        this.subscriber = subscriber;
        this.collectionName = "refreshSession";
        this.collectionTtlTokens = "ttlTokens";
        this.sessionMaxCount = sessionMaxCount;

        // redis-cli: config set notify-keyspace-events KEx
        this.subscriber.psubscribeAsync("__keyevent*__:expired");
        this.subscriber.on("pmessage",this.subscribeCb);
    }


    async createToken(options) {
        try{
        let refreshSession = await refreshSchema.validateAsync(options)

        refreshSession.refreshToken =await uuidv4();
        refreshSession.createdAt = Math.floor(Date.now() / 1000);

        let tokenPath = await this.getTokenPath(refreshSession.userId,refreshSession.refreshToken);
        let ttlTokenPath = await this.getTtlTokenPath(refreshSession.userId);

        let tokensCount = await this.storage.zcardAsync(ttlTokenPath);
        if(tokensCount>=this.sessionMaxCount) await this.removeOldToken(refreshSession.userId);

        await this.storage.zaddAsync(ttlTokenPath,refreshSession.createdAt,refreshSession.refreshToken);

        for( let key in refreshSession){
            if(key === "refreshToken" || key === "userId") continue;
            await this.storage.hsetAsync(tokenPath,key,refreshSession[key]);
        }

        await this.storage.expireatAsync(tokenPath,refreshSession.expiresIn);

        return refreshSession.refreshToken;
        } catch (e) {
            throw e;
        }
    }

    //arg[0] = userId, arg[1] = refreshToken or arg[0] = tokenPath
    async deleteToken(...args){
        try {
        let tokenPath;
        if(args.length===1){
            tokenPath=args[0];
        } else {
            tokenPath = await this.getTokenPath(args[0],args[1]);
        }

        let [colName,userId,refreshToken] = tokenPath.split(this.storage.separator);
        await this.storage.zremAsync(this.getTtlTokenPath(userId),refreshToken);
        return this.storage.delAsync(tokenPath);
        } catch (e) {
            throw e;
        }
    }

    async getTokens(userId){
        try{
        await joi.number().required().validateAsync(userId);

        let ttlTokenPath = await this.getTtlTokenPath(userId);
        let tokensArr = await this.storage.zrangeAsync(ttlTokenPath,"0","-1");
        let tokenDescriptionArr=[];
        for (let token of tokensArr){
            tokenDescriptionArr.push(await this.getTokenDescription(userId,token));
        }
        return tokenDescriptionArr;
        } catch (e) {
            throw e;
        }
    }

    //arg[0] = userId, arg[1] = refreshToken or arg[0] = tokenPath
    async getTokenDescription(...args){
        try {
            let tokenPath;
            if (args.length === 1) {
                tokenPath = args[0];
            } else {
                tokenPath = this.getTokenPath(args[0], args[1]);
            }
            let obj = await this.storage.hgetallAsync(tokenPath);
            if (obj == null) throw new Error("no refreshToken");

            let [colName, userId, refreshToken] = tokenPath.split(this.storage.separator);
            obj.userId = userId;
            obj.refreshToken = refreshToken
            return obj;
        } catch (e) {
            throw e;
        }
    }

    getTokenPath(userId,refreshToken){
        return this.collectionName+this.storage.separator+userId+this.storage.separator+refreshToken;
    }

    getTtlTokenPath(userId){
        return this.collectionTtlTokens+this.storage.separator+userId;
    }

    //dont need check expire, because key will be deleted after time expired
    async verifyToken(refreshSession){
        try {
        let refreshValidated = await tokenSchema.validateAsync(refreshSession);

        let token = await this.getTokenDescription(refreshValidated.userId,refreshValidated.refreshToken);
        if(token==null) return false;
        await this.deleteToken(refreshValidated.userId,refreshValidated.refreshToken);

        let validatedToken = await tokenSchema.validateAsync(token);

        for(let key in token){
            if(key==="createdAt" || key === "expiresIn") continue;
            if(validatedToken[key]!==refreshValidated[key]) return false;
        }
        return true
        } catch (e) {
            throw e;
        }
    }


    async removeOldToken(userId){
        try {
        await joi.number().required().validateAsync(userId);

        let ttlTokenPath =await this.getTtlTokenPath(userId);

        let [token,Date] = await this.storage.zpopminAsync(ttlTokenPath);
        let tokensPath = await this.getTokenPath(userId,token);

        return this.storage.delAsync(tokensPath);
        } catch (e) {
            throw e;
        }
    }

    subscribeCb = (pattern,key,refreshPath)=>{
        let [DbName,userId,token] = refreshPath.split(":");
        if(DbName===this.collectionName){
            let ttlTokenPath = this.getTtlTokenPath(userId);
            this.storage.zremAsync(ttlTokenPath,token);
        }
    }

}






module.exports = refreshSession;