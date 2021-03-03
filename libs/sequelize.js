const Sequelize = require('sequelize');
const config = require('../config');

const seqParams = config.get('sequelize');

const sequelize = new Sequelize(
  seqParams.database,
  process.env.USER,
  process.env.PASSWORD,
  seqParams,
);

sequelize.sync({ alter: true });
module.exports = sequelize;
