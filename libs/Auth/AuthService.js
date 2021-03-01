let {User,localData,vkData} = require('../../models/User');
let argon = require('argon2');
let AuthError = require('./AuthError');
let jwt = require('jsonwebtoken')
let refreshSession = require('../../models/refreshSession').refreshSession;
const config = require('../../config');


let redisClient = new (require('../redis'))(config.get('redis'));
let redisSub = new (require('../redis'))(config.get('redis'));
let refreshStorage = new refreshSession(redisClient,redisSub);



//todo access token to refresh token;
class AuthService{
    static tokenExpiresInMinutes =  30;
    static refreshTokenExpiresInMinutes = 60*24*3;

    static BlackListAccess="BlackListAccess";

    static async register(options){
        try {
            const {username,password} = options;

            let hashPassword = await this.hashPassword(password);

            let user = await User.create({
                profileType:"localData",
                localData:{
                    password:hashPassword,
                    username:username
                }
            },{
                include:[{
                    association:User.associations.localData,
                    as:"localData"
                }]
            })
            let userData = {
                userId: user.id
            }
            return userData;
        } catch (e) {
            throw e;
        }
    }
    static async hashPassword(password){
        return argon.hash(password);
    }

    static async verifyPassword(hashPassword,password){
        return argon.verify(hashPassword,password);
    }

    static async login(options){
        try {
            const {username,password,fingerprint,ua}=options;
            let LocalData = await localData.findOne({where:{
                    username:username
                }});
            if(!LocalData){
                throw new AuthError("AUTH","LOGIN","user not found",400); //todo code,status
            }
            let hashPassword = LocalData.password;
            if(!await this.verifyPassword(hashPassword, password)){
                throw new AuthError("AUTH","LOGIN","the password is incorrect",400) //todo code,status
            }else {
                let userData = {
                    userId: (await LocalData.getUser()).id
                }
                return this.generatePairOftokens({userData,fingerprint,ua});
            }
        } catch (e) {
            throw e;
        }
    }


    static async generatePairOftokens(options){
        let refreshToken = await refreshStorage.createToken({userId:options.userData.userId,expiresIn: Math.floor(Date.now()/1000)+this.tokenExpiresInMinutes*60,fingerprint:options.fingerprint,ua:options.ua});
        let accessToken = await this.generateToken(options.userData);
        return {refreshToken,accessToken};
    }


    static async generateToken(data){
        return jwt.sign(data,process.env.SECRETJWTKEY,{expiresIn: this.tokenExpiresInMinutes*60});
    }


    static async decodeToken(accessToken){
        return jwt.decode(accessToken);
    }


    static async addToBlackList(token){
        try {
            if(typeof token == "string"){
                let decodedToken = await jwt.decode(token);
                return !!redisClient.setAsync(this.BlackListAccess+redisClient.separator+token,true,'EX',Math.floor(decodedToken.exp-Date.now()/1000));
            }
        } catch (e) {
            throw e;
        }
    }

    static async verifyAccessToken(token,options={}){
        try {
            if(await redisClient.getAsync(this.BlackListAccess+redisClient.separator+token)){
                return false
            } else {
                return jwt.verify(token,process.env.SECRETJWTKEY,options);
            }
        } catch (e) {
            throw e;
        }
    }


    static async refreshAccessToken(options){
        const {fingerprint,ua,accessToken,refreshToken} = options;
        try {
	        const complete = await this.verifyAccessToken(accessToken,{ignoreExpiration:true});
            if(!complete) throw new Error("verify error : access token");
	        var {userId} = complete;
            if(Date.now()<=complete.exp*1000) await this.addToBlackList(accessToken);
            const verify = await refreshStorage.verifyToken({userId,fingerprint,ua,refreshToken});
            if(!verify) throw new Error("verify error : refresh token");
            let newRefreshToken = await refreshStorage.createToken({
                userId,
                fingerprint,
                ua,
                expiresIn: Math.floor(Date.now()/1000)+this.refreshTokenExpiresInMinutes*60
            });

            let user = await User.findByPk(userId); //todo rewrite this with polymorphic association
            let userData = {
                userId: user.id
            }
            let newAccessToken = await this.generateToken(userData);
            return {refreshToken:newRefreshToken,accessToken:newAccessToken};
        } catch (e) {
            if(userId) await refreshStorage.deleteToken(userId,refreshToken);
            throw e;
        }
    }
}

module.exports = AuthService;
