let User = require('../../models/User').User;
let argon = require('argon2');
let AuthError = require('./AuthError');
let jwt = require('jsonwebtoken')
let refreshSession = require('../../models/refreshSession').refreshSession;
const config = require('../../config');


let redisClient = new (require('../redis'))(config.get('redis'));
let redisSub = new (require('../redis'))(config.get('redis'));
let refreshStorage = new refreshSession(redisClient,redisSub);



//todo invalidate old access token;
class AuthService{
    static tokenExpiresInMinutes =  30;

    static BlackListAccess="BlackListAccess";

    static async register(options){
        try {
        const {username,email,password} = options;

        let hashPassword = await this.hashPassword(password);
        let user = await User.create({
            username,
            email,
            hashPassword
        })
        let userData = {
            userId: user.userId,
            username: user.username,
            email:user.email
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
        let user = await User.findOne({where:{
                username
            }});
        if(!user){
            throw new AuthError("AUTH","LOGIN","user not found",400); //todo code,status
        }
        if(!await this.verifyPassword(user.hashPassword, password)){
            throw new AuthError("AUTH","LOGIN","the password is incorrect",400) //todo code,status
        }else {
            let userData = {
                userId: user.userId,
                username: user.username,
                email:user.email
            }
            let refreshToken = await refreshStorage.createToken({userId:user.userId,expiresIn: Math.floor(Date.now()/1000)+this.tokenExpiresInMinutes*60,fingerprint,ua});
            let accessToken = await this.generateToken(userData);
            return {refreshToken,accessToken};
        }
        } catch (e) {
            throw e;
        }
    }


    static async generateToken(data){
        return jwt.sign(data,process.env.SECRETJWTKEY,{expiresIn: this.tokenExpiresInMinutes*60});
    }


    static async decodeToken(accessToken){
        return jwt.decode(accessToken,process.env.SECRETJWTKEY);
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

    static async verifyAccessToken(token){
        try {
        if(await redisClient.getAsync(this.BlackListAccess+redisClient.separator+token)){
            return false
        } else {
            return jwt.verify(token,process.env.SECRETJWTKEY);
        }
        } catch (e) {
            throw e;
        }
    }


    static async refreshAccessToken(options){
        const {fingerprint,ua,accessToken,refreshToken} = options;
        try {
            if(!await this.verifyAccessToken(accessToken)) throw new Error("verify error : access token");
            var {userId} = await this.decodeToken(accessToken);
            await this.addToBlackList(accessToken);
            const verify = await refreshStorage.verifyToken({userId,fingerprint,ua,refreshToken});
            if(!verify) throw new Error("verify error : refresh token");
            let newRefreshToken = await refreshStorage.createToken({
                userId,
                fingerprint,
                ua,
                expiresIn: Math.floor(Date.now()/1000)+this.tokenExpiresInMinutes*60
            });

            let user = await User.findByPk(userId);
            let userData = {
                userId: user.userId,
                username: user.username,
                email:user.email
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