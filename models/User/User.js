const Sequelize = require("sequelize");
const sequelize = require("../../libs/sequelize");
const Robot = require("../Robot").Robot;
const VkData = require("../AuthData/VkData.js");

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
            type: Sequelize.STRING,
            unique:true
        },
        hashPassword:{
            allowNull:false,
            type:Sequelize.STRING
        },
        profileType:{
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

User.hasOne(VkData);

User.belongsToMany(Robot,{through:"userToRobot",as:"robot"});
Robot.belongsToMany(User,{through:"userToRobot",as:"user"});

User.prototype.getJSON = async function (){
        let returnData = this.toJSON();
        returnData.robots = await this.getRobot().then((robots)=>{
            return robots.map((robot)=>{
                return robot.toJSON();
            })
        })
    return returnData;
}

User.prototype.getProfileData = async function(userId){
    try{
        return await this["get"+this.profileType+"Data"]()
    } catch(err){
        throw err;
    }
}

User.prototype.setProfileData = async function(userId,data){
    try{
        return await this["set"+this.profileType+"Data"](data)
    } catch(err){
        throw err;
    }
}


sequelize.sync({alter:true});
module.exports = User;