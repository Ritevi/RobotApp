const Sequelize = require("sequelize");
const sequelize = require("../../libs/sequelize");
const Robot = require("../Robot").Robot;
const localData = require("./LocalData");
const vkData = require("./VkData");

const uppercaseFirst = str => `${str[0].toUpperCase()}${str.substr(1)}`;

class User extends Sequelize.Model {}

User.init(
    {
        id:{
            primaryKey: true,
            type: Sequelize.INTEGER,
            autoIncrement:true
        },
        profileType:{
            type:Sequelize.STRING,
            allowNull: false
        }
    },
    {
        sequelize,
        modelName: "user",
        timestamps: true,
    }
);

User.prototype.getProfile = async function (options){
    if (!this.profileType) return Promise.resolve(null);
    const mixinMethodName = `get${uppercaseFirst(this.profileType)}`;
    return this[mixinMethodName](options);
}

vkData.hasOne(User,{
    foreignKey:'profileId',
    constraints:false,
    scope:{
        profileType:"vkData"
    },
    as:"user"
})

User.belongsTo(vkData,{foreignKey:"profileId",constraints:false,as:"vkData"})

localData.hasOne(User,{
    foreignKey:'profileId',
    constraints:false,
    scope:{
        profileType:"localData"
    },
    as:"user"
})

User.belongsTo(localData,{foreignKey:"profileId",constraints:false,as:"localData"})

//todo more automatically
User.addHook("afterFind",findResult=>{
    if (!Array.isArray(findResult)) findResult = [findResult];
    for (const instance of findResult) {
        if (instance==null) continue;
        if (instance.profileType === "localData" && instance.localData !== undefined) {
            instance.profile = instance.localData;
        } else if (instance.profileType === "vkData" && instance.vkData !== undefined) {
            instance.profile = instance.vkData;
        }

        // To prevent mistakes:
        delete instance.localData;
        delete instance.dataValues.localData;
        delete instance.vkData;
        delete instance.dataValues.vkData;
    }
})



User.belongsToMany(Robot,{through:"userToRobot"});
Robot.belongsToMany(User,{through:"userToRobot"});

User.prototype.getJSON = async function (){
        let returnData = this.toJSON();
        returnData.robots = await this.getRobot().then((robots)=>{
            return robots.map((robot)=>{
                return robot.toJSON();
            })
        })
    return returnData;
}

// User.prototype.getProfileData = async function(userId){
//     try{
//         return await this["get"+this.profileType+"Data"]()
//     } catch(err){
//         throw err;
//     }
// }
//
// User.prototype.setProfileData = async function(userId,data){
//     try{
//         return await this["set"+this.profileType+"Data"](data)
//     } catch(err){
//         throw err;
//     }
// }

module.exports = User;