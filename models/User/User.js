const Sequelize = require('sequelize');
const sequelize = require('../../libs/sequelize');
const { Robot } = require('../Robot');
const localData = require('./LocalData');
const vkData = require('./VkData');

const uppercaseFirst = (str) => `${str[0].toUpperCase()}${str.substr(1)}`;

class User extends Sequelize.Model {}

User.init(
  {
    id: {
      primaryKey: true,
      type: Sequelize.INTEGER,
      autoIncrement: true,
    },
    profileType: {
      type: Sequelize.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'user',
    timestamps: true,
  },
);

User.prototype.getProfile = async function getProfile(options) {
  if (!this.profileType) return Promise.resolve(null);
  const mixinMethodName = `get${uppercaseFirst(this.profileType)}`;
  return this[mixinMethodName](options);
};

vkData.hasOne(User, {
  foreignKey: 'profileId',
  constraints: false,
  scope: {
    profileType: 'vkData',
  },
  as: 'user',
  hooks: true,
});

User.belongsTo(vkData, {
  foreignKey: 'profileId', constraints: false, as: 'vkData', hooks: true,
});

localData.hasOne(User, {
  foreignKey: 'profileId',
  constraints: false,
  scope: {
    profileType: 'localData',
  },
  as: 'user',
  hooks: true,

});

User.belongsTo(localData, {
  foreignKey: 'profileId', constraints: false, as: 'localData', hooks: true,
});

User.addHook('afterFind', async (findResult) => {
  // eslint-disable-next-line no-param-reassign
  if (!Array.isArray(findResult)) findResult = [findResult];
  findResult.forEach((instance) => {
    if (instance != null) {
      if (instance.profileType === 'localData' && instance.localData !== undefined) {
        // eslint-disable-next-line no-param-reassign
        instance.profile = instance.localData;
      } else if (instance.profileType === 'vkData' && instance.vkData !== undefined) {
        // eslint-disable-next-line no-param-reassign
        instance.profile = instance.vkData;
      }
    }

    // To prevent mistakes:
    // eslint-disable-next-line no-param-reassign
    delete instance.localData;
    // eslint-disable-next-line no-param-reassign
    delete instance.dataValues.localData;
    // eslint-disable-next-line no-param-reassign
    delete instance.vkData;
    // eslint-disable-next-line no-param-reassign
    delete instance.dataValues.vkData;
  });
});

User.belongsToMany(Robot, { through: 'userToRobot', as: { singular: 'Robot', plural: 'Robot' } });
Robot.belongsToMany(User, { through: 'userToRobot', as: { singular: 'User', plural: 'User' } });

User.prototype.getJSON = async function getJSON() {
  const returnData = this.toJSON();
  const robots = await this.getRobot();
  returnData.robots = robots.map((robot) => robot.toJSON());
  return returnData;
};

module.exports = User;
