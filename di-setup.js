const awilix = require('awilix');
const { AccessStorage, AuthService, RefreshStorage } = require('./libs/Auth');
const { User, localData, vkData } = require('./models/User');
const RedisClient = require('./libs/redis');
const EmailService = require('./libs/Email');
const config = require('./config');

const container = awilix.createContainer({
  injectionMode: awilix.InjectionMode.PROXY,
});

container.register({
  AccessStorage: awilix.asClass(AccessStorage),
  RefreshStorage: awilix.asClass(RefreshStorage),
  AuthService: awilix.asClass(AuthService),
  UserStorage: awilix.asValue(User),
  LocalStorage: awilix.asValue(localData),
  VkStorage: awilix.asValue(vkData),
  RedisClient: awilix.asClass(RedisClient),
  RedisSub: awilix.asClass(RedisClient),
  RedisConfig: awilix.asValue(config.get('redis')),
  EmailService: awilix.asClass(EmailService).singleton(),
});

module.exports = {
  container,
};
