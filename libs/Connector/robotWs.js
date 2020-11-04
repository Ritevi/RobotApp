const wsServer = require("ws").Server;

class robotWs extends wsServer{
    constructor(options) {
        super(options);
        this.on("connection",this.onConnection);
        this.on("error",this.onError);
        this.robotMap = new Map();
    }

    onConnection(socket){
        socket.once("message",(msg)=> {
            this.robotAuth(msg, socket);
        });
    }

    emitError(err){
        this.emit("error",err); //todo check this
    }

    robotAuth(msg,socket){
        let uuid = msg.toString();
        if(this.verifyRobotId(uuid)){
            this.robotMap.set(uuid,socket);
            this.emit("robotAdd",uuid,socket);
        }
    }

    verifyRobotId(uuid){
        return true
    }

    onError(err){
        throw err;
    }

}

module.exports = robotWs;