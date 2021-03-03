const argon = require('argon2');
const jwt = require('jsonwebtoken');
const { User, localData } = require('../../models/User');
const AuthError = require('./AuthError');
const { RefreshSession } = require('../../models/refreshSession');
const config = require('../../config');

const RedisLib = require('../redis');

const redisClient = new RedisLib(config.get('redis'));
const redisSub = new RedisLib(config.get('redis'));

const refreshStorage = new RefreshSession(redisClient, redisSub);

// todo access token to refresh token;
class AuthService {
    static tokenExpiresInMinutes = 60;

    static refreshTokenExpiresInMinutes = 60 * 24 * 3;

    static BlackListAccess = 'BlackListAccess';

    static async register(options) {
      const { username, password } = options;

      const hashPassword = await this.hashPassword(password);

      const user = await User.create({
        profileType: 'localData',
        localData: {
          password: hashPassword,
          username,
        },
      }, {
        include: [{
          association: User.associations.localData,
          as: 'localData',
        }],
      });
      return {
        userId: user.id,
      };
    }

    static async hashPassword(password) {
      return argon.hash(password);
    }

    static async verifyPassword(hashPassword, password) {
      return argon.verify(hashPassword, password);
    }

    static async login(options) {
      const {
        username, password, fingerprint, ua,
      } = options;
      const LocalData = await localData.findOne({
        where: {
          username,
        },
      });
      if (!LocalData) {
        throw new AuthError('AUTH', 'LOGIN', 'user not found', 400); // todo code,status
      }
      const hashPassword = LocalData.password;
      if (!await this.verifyPassword(hashPassword, password)) {
        throw new AuthError('AUTH', 'LOGIN', 'the password is incorrect', 400); // todo code,status
      } else {
        const userData = {
          userId: (await LocalData.getUser()).id,
        };
        return this.generatePairOftokens({ userData, fingerprint, ua });
      }
    }

    static async generatePairOftokens(options) {
      const refreshToken = await refreshStorage.createToken({
        userId: options.userData.userId,
        expiresIn: Math.floor(Date.now() / 1000) + this.tokenExpiresInMinutes * 60,
        fingerprint: options.fingerprint,
        ua: options.ua,
      });
      const accessToken = await this.generateToken(options.userData);
      return { refreshToken, accessToken };
    }

    static async generateToken(data) {
      return jwt.sign(data, process.env.SECRETJWTKEY, {
        expiresIn: this.tokenExpiresInMinutes * 60,
      });
    }

    static async decodeToken(accessToken) {
      return jwt.decode(accessToken);
    }

    static async addToBlackList(token) {
      if (typeof token === 'string') {
        const decodedToken = await jwt.decode(token);
        return !!redisClient.setAsync(this.BlackListAccess + redisClient.separator + token, true, 'EX', Math.floor(decodedToken.exp - Date.now() / 1000));
      }
      throw new Error('value must be token string');
    }

    static async verifyAccessToken(token, options = {}) {
      if (await redisClient.getAsync(this.BlackListAccess + redisClient.separator + token)) {
        return false;
      }
      return jwt.verify(token, process.env.SECRETJWTKEY, options);
    }

    static async refreshAccessToken(options) {
      const {
        fingerprint, ua, accessToken, refreshToken,
      } = options;
      let userId;
      try {
        const complete = await this.verifyAccessToken(accessToken, { ignoreExpiration: true });
        if (!complete) throw new Error('verify error : access token');
        userId = complete.userId;
        if (Date.now() <= complete.exp * 1000) await this.addToBlackList(accessToken);
        const verify = await refreshStorage.verifyToken({
          userId, fingerprint, ua, refreshToken,
        });
        if (!verify) throw new Error('verify error : refresh token');
        const newRefreshToken = await refreshStorage.createToken({
          userId,
          fingerprint,
          ua,
          expiresIn: Math.floor(Date.now() / 1000) + this.refreshTokenExpiresInMinutes * 60,
        });

        const user = await User.findByPk(userId); // todo rewrite this with polymorphic association
        const userData = {
          userId: user.id,
        };
        const newAccessToken = await this.generateToken(userData);
        return { refreshToken: newRefreshToken, accessToken: newAccessToken };
      } catch (e) {
        if (userId) await refreshStorage.deleteToken(userId, refreshToken);
        throw e;
      }
    }
}

module.exports = AuthService;
