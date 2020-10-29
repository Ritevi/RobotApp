const net = require("net");

class tcpServer extends net.Server{
    constructor(options) {
        super(options);
        this.on("connection",this.socketInitialCallback);
        this.on("error",this.onError);
        this.on("listening",this.onListening);
        this.clientMap = new Map();
    }

    socketInitialCallback(socket){
        socket.once("data",(msg)=> {
            this.emit("auth",msg,socket);
        });
    }

    onError(err){
        throw err;
    }

    onListening(){
        console.log('server bound');
    }

}

module.exports = tcpServer;