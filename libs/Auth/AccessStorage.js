const jwt = require('jsonwebtoken');
const config = require('../../config');

class AccessStorage {
  constructor({ RedisClient }) {
    this.storage = RedisClient;
    this.tokenExpiresInMinutes = config.get('tokenExpiresInMinutes');
    this.BlackListAccess = 'BlackListAccess';
  }

  generateToken(data) {
    return jwt.sign(data, config.get('jwtsecret'), {
      expiresIn: this.tokenExpiresInMinutes * 60,
    });
  }

  // eslint-disable-next-line class-methods-use-this
  decodeToken(token) {
    return jwt.decode(token);
  }

  async verifyToken(token, options = {}) {
    if (await this.storage.getAsync(this.BlackListAccess + this.storage.separator + token)) {
      return false;
    }
    return jwt.verify(token, config.get('jwtsecret'), options);
  }

  async addToBlackList(token) {
    const decodedToken = await jwt.decode(token);
    return !!this.storage.setAsync(this.BlackListAccess + this.storage.separator + token, true, 'EX', Math.floor(decodedToken.exp - Date.now() / 1000));
  }

  async refreshToken(token, options = {}) {
    const { ignoreExpiration } = options;
    const userData = await this.verifyToken(token, { ignoreExpiration });
    if (!userData) throw new Error('verify error : access token');
    if (Date.now() <= userData.exp * 1000) await this.addToBlackList(token);
  }
}

exports.AccessStorage = AccessStorage;
