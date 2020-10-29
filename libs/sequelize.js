let config = require("../config");
let Sequelize = require("sequelize");
const seqParams = config.get("sequelize");

let sequelize = new Sequelize(
  seqParams.database,
  process.env.USER,
  process.env.PASSWORD,
  seqParams
);

module.exports = sequelize;
