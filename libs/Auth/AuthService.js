const AuthError = require('./AuthError');
class AuthService {
  constructor({
    RefreshStorage, AccessStorage, UserStorage, LocalStorage, EmailService,
  }) {
    this.refreshStorage = RefreshStorage;
    this.accessStorage = AccessStorage;
    this.userStorage = UserStorage;
    this.localData = LocalStorage;
    this.emailService = EmailService;
  }

  async register(options) {
    const { username, password, email } = options;
    const user = await this.userStorage.create({
      profileType: 'localData',
      localData: {
        password: await this.localData.hashPassword(password),
        username,
        email,
      },
    }, {
      include: [{
        association: this.userStorage.associations.localData,
        as: 'localData',
      }],
    });
    try {
      const profile = await user.getProfile();
      await this.emailService.registerEmail(email, profile.emailUUID);
    } catch (err) {
      await user.destroy();
      throw new AuthError('AUTH', 'REGISTER', 'email was not sent', 400);
    }
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
      throw new AuthError('AUTH', 'LOGIN', 'user not found', 400);
    }
    if (!localData.activeProfile) {
      throw new AuthError('AUTH', 'LOGIN', 'user not active', 400);
    }

    if (!await localData.verifyPassword(password)) {
      throw new AuthError('AUTH', 'LOGIN', 'the password is incorrect', 400);
    } else {
      const userData = {
        userId: (await localData.getUser()).id,
      };
      return this.generatePairOftokens({ userData, fingerprint, ua });
    }
  }

  async activateLocalProfile(options) {
    const { emailUUID } = options;
    const localData = await this.localData.findOne({
      where: {
        emailUUID,
      },
    });
    if (!localData) {
      throw new AuthError('AUTH', 'ACTIVATE', 'user not found', 400);
    }
    try {
      await localData.set('activeProfile', true);
      await localData.save();
    } catch (err) {
      throw new AuthError('AUTH', 'ACTIVATE', 'save error', 400);
    }
    return {
      active: true,
    };
  }

  // options: { userdata, fingerprint, ua}
  async generatePairOftokens(options) {
    const refreshToken = await this.refreshStorage.createToken({
      userId: options.userData.userId,
      expiresIn: Math.floor(Date.now() / 1000)
        + this.refreshStorage.refreshTokenExpiresInMinutes * 60,
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

      if (!complete) throw new AuthError('AUTH', 'REFRESH', 'verify error : access token', 400);

      userId = complete.userId;
      if (Date.now() <= complete.exp * 1000) await this.accessStorage.addToBlackList(accessToken);
      const verify = await this.refreshStorage.verifyToken({
        userId, fingerprint, ua, refreshToken,
      });
      if (!verify) throw new AuthError('AUTH', 'REFRESH', 'verify error : refresh token', 400);
      const newRefreshToken = await this.refreshStorage.createToken({
        userId,
        fingerprint,
        ua,
        expiresIn: Math.floor(Date.now() / 1000)
          + this.refreshStorage.refreshTokenExpiresInMinutes * 60,
      });

      const user = await this.userStorage.findByPk(userId);
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
