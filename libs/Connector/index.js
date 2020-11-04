const config = require("../../config");
const robotWs = require("./robotWs");
const userWs = require("./userWs");
const eventEmitter= require("events");
const AuthService = require("../Auth");
const RobotService = require("../Robot");

//u need to close the connection after change the robot
class ConnectorWS extends eventEmitter{
    constructor(options) {
        super(options);
        this.robotWs = new robotWs(config.get("robotWs"));
        this.userWs = new userWs(config.get("userWs"));
        this.robotWs.on("robotAdd",this.onRobotAdd.bind(this));
        this.userWs.on("userAdd",this.onUserAdd.bind(this));
        this.userToRobot = new Map();
        this.on("userError",this.onUserError);
        this.on("cmd",this.onCmd);
        this.on("changeRobot",this.onChangeRobot);
    }

    onRobotAdd(uuid,socket){
        console.log("robot add : "+uuid);
    }

    onUserAdd(userId,socket){
        console.log("user add : "+userId);

        socket.on("message",(msg)=>{
            try{
                let jsonMsg = JSON.parse(msg.toString());
                this.emit(jsonMsg.type,jsonMsg); //todo verify type
                switch (jsonMsg.type){
                    case "cmd":this.emit("cmd",socket.userId,jsonMsg.body); break;
                    case "changeRobot":this.emit("changeRobot",socket.userId,jsonMsg.uuid); break;
                    default:
                        break;
                }
            } catch (err){
                this.emit("userError",err);
            }

        })
    }

    onCmd(userId,cmd){
        if(cmd){
            let robotUuid = this.userToRobot.get(userId);
            let robotSocket = this.robotWs.robotMap.get(robotUuid);
            robotSocket.send(JSON.stringify({cmd,type:"cmd"}));
        }
    }

    onChangeRobot(userId,uuid){
        this.userToRobot.set(userId,uuid); //todo verify that user can use this robot
    }

    onUserError(userId,msg){
        console.error("userError : ",userId,msg);
    }


}


module.exports = ConnectorWS;