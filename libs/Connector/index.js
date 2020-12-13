const config = require("../../config");
const eventEmitter= require("events");
const AuthService = require("../Auth");
const RobotService = require("../Robot");
const wsServer = require("ws").Server;

//u need to close the connection after change the robot
class ConnectorWS extends wsServer{
    constructor(options) {
        super(options);
        this.userMap = new Map();
        this.robotMap = new Map();
        this.userToRobot = new Map();
        this.robotToUser = new Map();
        this.on("connection",this.onConnection);
        this.on("error",this.onError);

        this.on("userAdd",this.onUserAdd);
        this.on("robotAdd",this.onRobotAdd);

        this.on("cmd",this.onCmd);
        this.on("changeRobot",this.onChangeRobot);

        this.on("info",this.onInfo);
    }

    onConnection(socket, request, ...args){
        socket.once("message",(msg)=> {
            try{
                let jsonMsg = JSON.parse(msg.toString());
                switch (jsonMsg.type){
                    case "authUser":this.authUser(jsonMsg.body,socket);
                        break;
                    case "authRobot":this.authRobot(jsonMsg.body,socket);
                        break;
                    default:
                        break;
                }
            } catch (err){
                socket.send({type:"error",body:err});
                this.emit("error",err);
            }
        });
    }


    onRobotAdd(uuid,socket){
        console.log("robot add : "+uuid);

        socket.on("message",(msg)=>{
            try{
                let jsonMsg = JSON.parse(msg.toString());
                switch (jsonMsg.type){
                    case "info":this.emit("info",socket.userId,jsonMsg.body); break;
                    default:
                        break;
                }
            } catch (err){
                socket.send({type:"authRobotError",body:err})
            }

        })
    }

    onUserAdd(userId,socket){
        console.log("user add : "+userId);
        socket.on("message",console.log);
        socket.on("message",(msg)=>{
            try{

                let jsonMsg = JSON.parse(msg.toString());
                switch (jsonMsg.type){
                    case "cmd":this.emit("cmd",socket.userId,jsonMsg.body); break;
                    case "changeRobot":this.emit("changeRobot",socket.userId,jsonMsg.body); break;
                    default:
                        break;
                }
            } catch (err){
                socket.send({type:"authUserError",body:err})
            }

        })
    }

    onCmd(userId,cmd){
        try {
            if (cmd) {
                let robotUuid = this.userToRobot.get(userId);
                let robotSocket = this.robotMap.get(robotUuid);
                if (!robotSocket) robotSocket.send({type: "error", body: new Error("no robot socket")});
                robotSocket.send(JSON.stringify({body: cmd, type: "cmd"}));
            } else {
                throw new Error("no cmd");
            }
        } catch (err){

        }
    }

    onInfo(uuid,info){
        try {
            if (info) {
                let userId = this.robotToUser.get(uuid);
                let userSocket = this.userMap.get(userId);
                if (!userSocket) userSocket.send({type: "infoError", body: new Error("no user socket")});
                userSocket.send(JSON.stringify({body: info, type: "info"}));
            } else {
                throw new Error("no info");
            }
        } catch (err){
            let robotSocket = this.robotMap.get(uuid);
            robotSocket.send({type:"infoError",body:err});
        }
    }

    onChangeRobot(userId,uuid){
        this.userToRobot.set(userId,uuid); //todo verify that user can use this robot
        this.robotToUser.set(uuid,userId);
    }


    authRobot(msg, socket){
        try {
            let uuid = msg.toString();
            if (this.verifyRobotId(uuid)) {
                this.robotMap.set(uuid, socket);
                this.emit("robotAdd", uuid, socket);
            }
        }catch (err){
            socket.send({type:"authRobotError",body:err});
        }
    }

    verifyRobotId(uuid){
        return true
    }


    authUser(msg,socket){
        try {
            let token = msg.toString();
            if(!token) this.emit("error",new Error("no token"));

            AuthService.verifyAccessToken(token).then(userData=>{
                let userId = userData.userId;
                socket.userId = userId;
                this.userMap.set(userData.userId,socket);
                socket.on("close",this.onCloseSocket.bind(this,socket));
                this.emit("userAdd",userId,socket);
            }).catch(err=>{
                throw err;
            })
        } catch (err){
            this.emit("error",err);
            socket.send({type:"authUserError",body:err});
            socket.destroy();
        }

    }

    onCloseSocket(socket){
        this.userMap.delete(socket.userId);
    }
    onError(err){
        throw err;
    }


}


module.exports = ConnectorWS;