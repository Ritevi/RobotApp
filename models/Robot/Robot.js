const Sequelize = require("sequelize");
const sequelize = require("../../libs/sequelize");


class Robot extends Sequelize.Model {}

Robot.init(
    {
        id:{
            primaryKey: true,
            type: Sequelize.INTEGER,
            autoIncrement:true
        },
        uuid:{
            type: Sequelize.STRING(),
            unique:true
        }
    },
    {
        sequelize,
        modelName: "Robot",
        timestamps: false,
    }
);

module.exports = Robot;