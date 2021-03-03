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
});

User.belongsTo(vkData, { foreignKey: 'profileId', constraints: false, as: 'vkData' });

localData.hasOne(User, {
  foreignKey: 'profileId',
  constraints: false,
  scope: {
    profileType: 'localData',
  },
  as: 'user',
});

User.belongsTo(localData, { foreignKey: 'profileId', constraints: false, as: 'localData' });

// todo more automatically
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

User.belongsToMany(Robot, { through: 'userToRobot' });
Robot.belongsToMany(User, { through: 'userToRobot' });

User.prototype.getJSON = async function getJSON() { // todo check or remove this method
  const returnData = this.toJSON();
  returnData.robots = await this.getRobot().then((robots) => robots.map((robot) => robot.toJSON()));
  return returnData;
};

// User.prototype.getProfileData = async function(userId){
//     try{
//         return await this["get"+this.profileType+"Data"]()
//     } catch(err){
//         throw err;
//     }
// }
//
// User.prototype.setProfileData = async function(userId,data){
//     try{
//         return await this["set"+this.profileType+"Data"](data)
//     } catch(err){
//         throw err;
//     }
// }

module.exports = User;
