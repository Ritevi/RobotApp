const tcpServer = require('./tcpServer');
const AuthService = require("../Auth");

class userServer extends tcpServer{
    constructor(options) {
        super(options);
        this.on("auth",this.onAuth);
    }

    onAuth(msg,socket){
        try {
            let token = msg.toString();
            console.log(msg.toString());
            AuthService.verifyAccessToken(token).then(userData=>{
                let userId = userData.userId;
                socket.userId = userId;
                this.clientMap.set(userData.userId,socket);
                socket.on("close",this.onCloseSocket.bind(this,socket));
                this.emit("clientAdd",userId,socket);
            }).catch(err=>{
                throw err;
            })
        } catch (err){
            socket.destroy();
            throw err;
            //todo socket send err
        }

    }

    onCloseSocket(socket,...rest){
        this.clientMap.delete(socket.userId);
    }

    onError(err){
        throw err;
    }
}


module.exports = userServer