const Sequelize = require("sequelize");
const sequelize = require("../../libs/sequelize");
const Robot = require("../Robot").Robot;


class User extends Sequelize.Model {}

User.init(
    {
        userId:{
            primaryKey: true,
            type: Sequelize.INTEGER,
            autoIncrement:true
        },
        username:{
            allowNull: false,
            type: Sequelize.STRING(64),
            unique:true
        },
        hashPassword:{
            allowNull:false,
            type:Sequelize.STRING
        },
        email:{
            allowNull:false,
            type:Sequelize.STRING,
            unique:true
        }
    },
    {
        sequelize,
        modelName: "User",
        timestamps: false,
    }
);

User.belongsToMany(Robot,{through:"UserToRobot",as:"robot"});
Robot.belongsToMany(User,{through:"UserToRobot",as:"user"});


module.exports = User;