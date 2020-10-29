const net = require("net");

class tcpServer extends net.Server{
    constructor(...args) {
        super(args);
        this.on("connection",this.socketInitialCallback);
        this.on("error",this.onError);
        this.on("listening",this.onListening);
        this.robotMap = new Map();
    }

    socketInitialCallback(socket){
        socket.once("data",(msg)=> {
           this.robotAuth(msg,socket);
        });
    }

    onError(err){
        throw err;
    }

    robotAuth(msg,socket){
        let uuid = msg.toString();
        if(this.verifyRobotId(uuid)){
            this.robotMap.set(uuid,socket);
        }
    }

    verifyRobotId(uuid){
        return true
    }

    onListening(){
        console.log('server bound');
    }

}

module.exports = tcpServer;