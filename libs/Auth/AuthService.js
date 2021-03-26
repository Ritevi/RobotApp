const AuthError = require('./AuthError');
// todo access token to refresh token;
class AuthService {
  constructor({
    RefreshStorage, AccessStorage, UserStorage, LocalStorage,
  }) {
    this.refreshStorage = RefreshStorage;
    this.accessStorage = AccessStorage;
    this.userStorage = UserStorage;
    this.localData = LocalStorage;
  }

  async register(options) {
    const { username, password } = options;
    const user = await this.userStorage.create({
      profileType: 'localData',
      localData: {
        password: await this.localData.hashPassword(password),
        username,
      },
    }, {
      include: [{
        association: this.userStorage.associations.localData,
        as: 'localData',
      }],
    });
    return {
      userId: user.id,
    };
  }

  async login(options) {
    const {
      username, password, fingerprint, ua,
    } = options;
    // eslint-disable-next-line no-shadow
    const localData = await this.localData.findOne({
      where: {
        username,
      },
    });
    if (!localData) {
      throw new AuthError('AUTH', 'LOGIN', 'user not found', 400); // todo code,status
    }
    if (!await localData.verifyPassword(password)) {
      throw new AuthError('AUTH', 'LOGIN', 'the password is incorrect', 400); // todo code,status
    } else {
      const userData = {
        userId: (await localData.getUser()).id,
      };
      return this.generatePairOftokens({ userData, fingerprint, ua });
    }
  }

  // options: { userdata, fingerprint, ua}
  async generatePairOftokens(options) {
    const refreshToken = await this.refreshStorage.createToken({
      userId: options.userData.userId,
      expiresIn: Math.floor(Date.now() / 1000)
        + this.refreshStorage.refreshTokenExpiresInMinutes * 60,
      // todo remove string above, its already in class
      fingerprint: options.fingerprint,
      ua: options.ua,
    });
    const accessToken = await this.accessStorage.generateToken(options.userData);
    return { refreshToken, accessToken };
  }

  async refreshAccessToken(options) {
    const {
      fingerprint, ua, accessToken, refreshToken,
    } = options;
    let userId;
    try {
      const complete = await this.accessStorage.verifyToken(
        accessToken,
        { ignoreExpiration: true },
      );
      if (!complete) throw new Error('verify error : access token');
      userId = complete.userId;
      if (Date.now() <= complete.exp * 1000) await this.accessStorage.addToBlackList(accessToken);
      const verify = await this.refreshStorage.verifyToken({
        userId, fingerprint, ua, refreshToken,
      });
      if (!verify) throw new Error('verify error : refresh token');
      const newRefreshToken = await this.refreshStorage.createToken({
        userId,
        fingerprint,
        ua,
        expiresIn: Math.floor(Date.now() / 1000)
          + this.refreshStorage.refreshTokenExpiresInMinutes * 60,
      });

      const user = await this.userStorage.findByPk(userId);
      // todo rewrite this with polymorphic association
      const userData = {
        userId: user.id,
      };
      const newAccessToken = await this.accessStorage.generateToken(userData);
      return { refreshToken: newRefreshToken, accessToken: newAccessToken };
    } catch (e) {
      if (userId) await this.refreshStorage.deleteToken(userId, refreshToken);
      throw e;
    }
  }
}

module.exports = AuthService;
