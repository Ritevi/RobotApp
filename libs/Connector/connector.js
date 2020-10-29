const config = require("../../config");
const tcpServer = require("./tcpServer");
const wsServer = require("./socket");
const eventEmitter= require("events");
const AuthService = require("../Auth");

class Connector extends eventEmitter{
    constructor(options) {
        super(options);
        this.tcpServer = new tcpServer();
        this.tcpServer.listen(config.get("tcpServer"));
        this.wsServer = new wsServer(options.wsServer);
    }

    onSocketEvent(socketUuid,eventName,cb){
        this.robotMap.get(socketUuid.toString()).on(eventName,cb);
    }

}


module.exports = Connector;