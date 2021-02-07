const Sequelize = require("sequelize");
const sequelize = require("../../libs/sequelize");


class VkData extends Sequelize.Model {}

VkData.init(
    {
        id:{
            primaryKey: true,
            type: Sequelize.INTEGER,
            autoIncrement:true
        },
        uid:{
            allowNull:false,
            type:Sequelize.INTEGER,
            unique:true
        },
        firstName:{
            type:Sequelize.STRING,
        },
        secondName:{
            type:Sequelize.STRING,
        }
    },
    {
        sequelize,
        modelName: "VkData",
        timestamps: false,
    }
);


module.exports = VkData;