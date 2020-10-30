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
        modelName: "user",
        timestamps: false,
    }
);

User.belongsToMany(Robot,{through:"userToRobot",as:"robot"});
Robot.belongsToMany(User,{through:"userToRobot",as:"user"});

User.prototype.getJSON = function (){
    let returnData = this.toJSON();
    returnData.robots = this.getRobot().then((robots)=>{
        return robots.map((robot)=>{
            return robot.toJSON();
        })
    })
    return returnData;
}

sequelize.sync({alter:true});
module.exports = User;