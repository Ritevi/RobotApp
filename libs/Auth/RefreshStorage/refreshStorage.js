const joi = require('joi');
const uuidv4 = require('uuid').v4;

const refreshSchema = joi.object({
  userId: [joi.number().required(), joi.string().required()],
  expiresIn: joi.date().timestamp('unix').raw().required(),
  ua: joi.string().required().default(''),
  fingerprint: joi.string().required().default(''),
});

const tokenSchema = joi.object({
  userId: [joi.number().required(), joi.string().required()],
  refreshToken: joi.string().uuid().required(),
  ua: joi.string().required().default(''),
  fingerprint: joi.string().required().default(''),
  expiresIn: joi.date().timestamp('unix').raw(),
  createdAt: joi.date().timestamp('unix').raw(),
});

/*
 think about get pair of access and refresh token in redis to verify,
  that this access token belongs to some refresh token
*/

class RefreshStorage {
  constructor({ RedisClient, RedisSub }) {
    this.storage = RedisClient;
    this.subscriber = RedisSub;
    this.collectionName = 'RefreshStorage';
    this.collectionTtlTokens = 'ttlTokens';
    this.sessionMaxCount = 5;
    this.refreshTokenExpiresInMinutes = 60 * 24 * 3;
    this.subscriber.psubscribeAsync('__keyevent*__:expired');
    this.subscriber.on('pmessage', this.subscribeCb);
  }

  async createToken(options) {
    const refreshSession = await refreshSchema.validateAsync(options);

    refreshSession.refreshToken = await uuidv4();
    refreshSession.createdAt = Math.floor(Date.now() / 1000);

    const tokenPath = await this.getTokenPath(refreshSession.userId, refreshSession.refreshToken);
    const ttlTokenPath = await this.getTtlTokenPath(refreshSession.userId);

    const tokensCount = await this.storage.zcardAsync(ttlTokenPath);
    if (tokensCount >= this.sessionMaxCount) await this.removeOldestToken(refreshSession.userId);

    await this.storage.zaddAsync(ttlTokenPath,
      refreshSession.createdAt,
      refreshSession.refreshToken);

    await Promise.all(Object.keys(refreshSession).map(async (key) => {
      if (key !== 'refreshToken' && key !== 'userId') {
        await this.storage.hsetAsync(tokenPath, key, refreshSession[key]);
      }
    }));

    await this.storage.expireatAsync(tokenPath, refreshSession.expiresIn);

    return refreshSession.refreshToken;
  }

  // arg[0] = userId, arg[1] = refreshToken or arg[0] = tokenPath
  async deleteToken(...args) {
    let tokenPath;
    if (args.length === 1) {
      [tokenPath] = args;
    } else {
      tokenPath = await this.getTokenPath(args[0], args[1]);
    }

    const [, userId, refreshToken] = tokenPath.split(this.storage.separator);
    await this.storage.zremAsync(this.getTtlTokenPath(userId), refreshToken);
    return this.storage.delAsync(tokenPath);
  }

  async getTokens(userId) {
    await joi.number().required().validateAsync(userId);

    const ttlTokenPath = await this.getTtlTokenPath(userId);
    const tokensArr = new Array(await this.storage.zrangeAsync(ttlTokenPath, '0', '-1'));
    const tokenDescriptionArr = [];
    await Promise.all(tokensArr.map(async (token) => {
      tokenDescriptionArr.push(await this.getTokenDescription(userId, token));
    }));
    return tokenDescriptionArr;
  }

  // arg[0] = userId, arg[1] = refreshToken or arg[0] = tokenPath
  async getTokenDescription(...args) {
    let tokenPath;
    if (args.length === 1) {
      [tokenPath] = args;
    } else {
      tokenPath = this.getTokenPath(args[0], args[1]);
    }
    const obj = await this.storage.hgetallAsync(tokenPath);
    if (obj == null) throw new Error('no refreshToken');

    const [, userId, refreshToken] = tokenPath.split(this.storage.separator);
    obj.userId = userId;
    obj.refreshToken = refreshToken;
    return obj;
  }

  getTokenPath(userId, refreshToken) {
    return this.collectionName
        + this.storage.separator
        + userId
        + this.storage.separator
        + refreshToken;
  }

  getTtlTokenPath(userId) {
    return this.collectionTtlTokens + this.storage.separator + userId;
  }

  async verifyToken(refreshSession) {
    const refreshValidated = await tokenSchema.validateAsync(refreshSession);

    const token = await this.getTokenDescription(refreshValidated.userId,
      refreshValidated.refreshToken);
    if (token == null) return false;
    await this.deleteToken(refreshValidated.userId, refreshValidated.refreshToken);

    const validatedToken = await tokenSchema.validateAsync(token);

    await Promise.all(Object.keys(token).map(async (key) => {
      if (key !== 'createdAt' && key !== 'expiresIn') {
        if (validatedToken[key] !== refreshValidated[key]) throw new Error('values are not equal');
      }
    }));
    return true;
  }

  async removeOldestToken(userId) {
    await joi.number().required().validateAsync(userId);

    const ttlTokenPath = await this.getTtlTokenPath(userId);

    const [token] = await this.storage.zpopminAsync(ttlTokenPath);
    const tokensPath = await this.getTokenPath(userId, token);

    return this.storage.delAsync(tokensPath);
  }

  async refreshToken(options) {
    const {
      refreshToken, ua, fingerprint, userId,
    } = options;
    const verify = await this.verifyToken({
      refreshToken, ua, fingerprint, userId,
    });
    if (!verify) throw new Error('verify error : refresh token');
    return this.createToken({
      userId,
      fingerprint,
      ua,
      expiresIn: Math.floor(Date.now() / 1000) + this.refreshTokenExpiresInMinutes * 60,
    });
  }

  subscribeCb = (pattern, key, refreshPath) => {
    const [DbName, userId, token] = refreshPath.split(':');
    if (DbName === this.collectionName) {
      const ttlTokenPath = this.getTtlTokenPath(userId);
      this.storage.zremAsync(ttlTokenPath, token);
    }
  }
}

module.exports = RefreshStorage;
