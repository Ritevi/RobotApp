const Sequelize = require("sequelize");
const sequelize = require("../../libs/sequelize");

class localData extends Sequelize.Model {}

localData.init(
    {
        id:{
            primaryKey: true,
            type: Sequelize.INTEGER,
            autoIncrement:true
        },
        username:{
            type:Sequelize.STRING,
            allowNull: false,
            unique:true
        },
        password:{
            type:Sequelize.STRING,
            allowNull:false
        }
    },
    {
        sequelize,
        modelName: "localData",
        timestamps: false,
    }
);

module.exports = localData;