const Sequelize = require("sequelize");
const sequelize = require("../../libs/sequelize");

class vkData extends Sequelize.Model {}

vkData.init(
    {
        id:{
            primaryKey: true,
            type: Sequelize.INTEGER,
            autoIncrement:true
        },
        uuid:{
            type:Sequelize.STRING,
            allowNull: false,
            unique:true
        },
        first_name:{
            type:Sequelize.STRING,
            allowNull:false
        },
        second_name:{
            type:Sequelize.STRING,
            allowNull:false
        }
    },
    {
        sequelize,
        modelName: "vkData",
        timestamps: false,
    }
);

module.exports = vkData;