const WebSocket = require('ws');
const AuthService = require("../Auth");
//todo users and robot Map
//todo Event: 'headers' modify start request
class wsSocket extends WebSocket.Server{
    constructor(options) {
        super(options);
        this.on("connection",this.onConnection);
        this.on("error",this.onError);
        this.userMap = new Map();
    }

    onConnection(socket, request, ...args){
        socket.once("data",(msg)=> {
            this.authUser(msg,socket);
        });
    }

    authUser(msg,socket){
        try {
            let token = JSON.parse(msg.toString())
            AuthService.verifyAccessToken(token).then(userData=>{
                let userId = userData.userId;
                socket.userId = userId;
                this.userMap.set(userData.userId,socket);
            }).catch(err=>{
                throw err;
            })
        } catch (err){
            throw err;
            //todo socket send err
        }

    }

    onCloseSocket(socket){

    }

    onMessage(msg){
        console.log(msg);



        // if(msg.type && msg.data){
        //     this.emit(msg.type,msg.data);
        // }
    }

    onError(err){
        throw err;
    }
}


module.exports = wsSocket