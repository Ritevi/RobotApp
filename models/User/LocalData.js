const Sequelize = require('sequelize');
const bcrypt = require('bcrypt');
const sequelize = require('../../libs/sequelize');

class localData extends Sequelize.Model {}

localData.init(
  {
    id: {
      primaryKey: true,
      type: Sequelize.INTEGER,
      autoIncrement: true,
    },
    activeProfile: {
      type: Sequelize.BOOLEAN,
    },
    email: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
    },
    emailUUID: {
      type: Sequelize.UUIDV4,
      allowNull: false,
      unique: true,
    },
    username: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: Sequelize.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'localData',
    timestamps: false,
  },
);

localData.verifyPassword = function (hashPassword, password) {
  return bcrypt.compare(password, hashPassword);
};

localData.hashPassword = async function (password) {
  return bcrypt.hash(password, 10);
};

localData.prototype.verifyPassword = function (password) {
  const hashPassword = this.getDataValue('password');
  return localData.verifyPassword(hashPassword, password);
};

module.exports = localData;
