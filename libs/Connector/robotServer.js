const tcpServer = require('./tcpServer');
const robotService = require("../Robot");

class robotServer extends tcpServer{
    constructor(options) {
        super(options);
        this.on("auth",this.onAuth);
    }

    onAuth(msg,socket){
        let uuid = msg.toString();
        if(this.verifyRobotId(uuid)){
            socket.robotId = uuid;
            this.clientMap.set(uuid,socket);
            this.emit("clientAdd",uuid,socket);
            socket.on("close",this.onCloseSocket.bind(this,socket));
        }
    }

    verifyRobotId(uuid){
        return true
    }

    onCloseSocket(socket,...rest){
        this.clientMap.delete(socket.robotId);
    }

}

module.exports = robotServer;