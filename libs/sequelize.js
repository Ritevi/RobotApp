const Sequelize = require('sequelize');
const config = require('../config');

const seqParams = config.get('sequelize');

const sequelize = new Sequelize(
  seqParams.database,
  seqParams.user,
  seqParams.password,
  seqParams,
);

if (process.env.ENV === 'test') {
  sequelize.sync({ force: true });
}
if (process.env.ENV === 'dev') {
  sequelize.sync({ alter: true });
}

module.exports = sequelize;
