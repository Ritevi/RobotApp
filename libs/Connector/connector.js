const config = require("../../config");
const tcpServer = require("./tcpServer");
const wsServer = require("./socket");
const eventEmitter= require("events");
const AuthService = require("../Auth");
const RobotService = require("../Robot");


//u need to close the connection after change the robot
class Connector extends eventEmitter{
    constructor(options) {
        super(options);
        this.tcpServer = new tcpServer();
        this.tcpServer.listen(config.get("tcpServer"));
        this.wsServer = new wsServer(options.wsServer);
        this.tcpServer.on("robotAdd",this.onRobotAdd.bind(this));
        this.wsServer.on("userAdd",this.onUserAdd.bind(this));
    }

    onSocketEvent(socketUuid,eventName,cb){
        this.robotMap.get(socketUuid.toString()).on(eventName,cb);
    }

    onRobotAdd(uuid,socket){
        console.log("robot add : "+uuid);
    }

    onUserAdd(userId,socket){
        console.log("user add : "+userId);
        RobotService.getRobot(userId).then((robotId)=>{
            let robotSocket = this.tcpServer.robotMap.get(robotId);
            socket.on("message",this.writeToRobot.bind(this,robotSocket));
        })
    }

    writeToRobot(robotSocket,msg){
        robotSocket.write(msg);
    }
}


module.exports = Connector;