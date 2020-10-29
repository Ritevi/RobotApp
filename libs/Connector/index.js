const config = require("../../config");
const tcpServer = require("./robotServer");
const userServer = require("./userServer");
const eventEmitter= require("events");
const AuthService = require("../Auth");
const RobotService = require("../Robot");


//u need to close the connection after change the robot
class Connector extends eventEmitter{
    constructor(options) {
        super(options);
        this.robotServer = new tcpServer();
        this.robotServer.listen(config.get("tcpServer"));
        this.userServer = new userServer();
        this.userServer.listen(config.get("userServer"));
        this.robotServer.on("clientAdd",this.onRobotAdd.bind(this));
        this.userServer.on("clientAdd",this.onUserAdd.bind(this));
    }


    onRobotAdd(uuid,socket){
        console.log("robot add : "+uuid);
    }

    onUserAdd(userId,socket){
        console.log("user add : "+userId);
        RobotService.getRobot(userId).then((robotId)=>{
            console.log(robotId);
            let robotSocket = this.robotServer.clientMap.get(robotId);
            socket.on("data",this.writeToRobot.bind(this,robotSocket));
        })
    }

    writeToRobot(robotSocket,msg){
        robotSocket.write(msg);
    }
}


module.exports = Connector;