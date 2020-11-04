const AuthService = require("../Auth");
const wsServer = require("ws").Server;

class userWs extends wsServer{
    constructor(options) {
        super(options);
        this.on("connection",this.onConnection);
        this.on("error",this.onError);
        this.userMap = new Map();
    }

    onConnection(socket, request, ...args){
        socket.once("message",(msg)=> {
            this.authUser(msg,socket);
        });
    }


    authUser(msg,socket){
        try {
            //take jwt token with userId and robot Id ????
            let token = msg.toString();
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
            throw err;
            socket.destroy();
            //todo socket send err
        }

    }

    onCloseSocket(socket,...rest){
        this.userMap.delete(socket.userId);
    }

    onError(err){
        throw err;
    }
}


module.exports = userWs