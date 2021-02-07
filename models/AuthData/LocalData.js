const Sequelize = require("sequelize");
const sequelize = require("../../libs/sequelize");


class LocalData extends Sequelize.Model {}

LocalData.init(
    {
        id:{
            primaryKey: true,
            type: Sequelize.INTEGER,
            autoIncrement:true
        },
        email:{
            allowNull:false,
            type:Sequelize.STRING,
            unique:true
        }
    },
    {
        sequelize,
        modelName: "LocalData",
        timestamps: false,
    }
);

module.exports = LocalData;