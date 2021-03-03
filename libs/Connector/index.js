const wsServer = require('ws').Server;
const { AuthService } = require('../Auth');

// u need to close the connection after change the robot
class ConnectorWS extends wsServer {
  constructor(options) {
    super(options);
    this.userMap = new Map();
    this.robotMap = new Map();
    this.userToRobot = new Map();
    this.robotToUser = new Map();
    this.on('connection', this.onConnection);
    this.on('error', this.onError);

    this.on('userAdd', this.onUserAdd);
    this.on('robotAdd', this.onRobotAdd);

    this.on('cmd', this.onCmd);
    this.on('changeRobot', this.onChangeRobot);

    this.on('info', this.onInfo);
  }

  onConnection(socket) {
    socket.send('nice1');
    socket.once('message', (msg) => {
      try {
        const jsonMsg = JSON.parse(msg.toString());
        switch (jsonMsg.type) {
          case 'authUser': this.authUser(jsonMsg.body, socket);
            break;
          case 'authRobot': this.authRobot(jsonMsg.body, socket);
            break;
          default:
            break;
        }
      } catch (err) {
        socket.send(JSON.stringify({ type: 'error', body: err.toString() }));
        this.emit('error', err);
      }
    });
  }

  onRobotAdd(uuid, socket) {
    console.log(`robot add : ${uuid}`);
    socket.send('nice2');
    socket.on('message', (msg) => {
      try {
        const jsonMsg = JSON.parse(msg.toString());
        switch (jsonMsg.type) {
          case 'info': this.emit('info', socket.id, jsonMsg.body); break;
          default:
            break;
        }
      } catch (err) {
        socket.send(JSON.stringify({ type: 'Error', body: err.toString() }));
      }
    });
  }

  onUserAdd(userId, socket) {
    console.log(`user add : ${userId}`);
    socket.send('nice2');
    socket.on('message', console.log);
    socket.on('message', (msg) => {
      try {
        const jsonMsg = JSON.parse(msg.toString());
        switch (jsonMsg.type) {
          case 'cmd': this.emit('cmd', socket.id, jsonMsg.body); break;
          case 'changeRobot': this.emit('changeRobot', socket.id, jsonMsg.body); break;
          default:
            break;
        }
      } catch (err) {
        socket.send(JSON.stringify({ type: 'Error', body: err.toString() }));
      }
    });
  }

  onCmd(userId, cmd) {
    if (cmd) {
      const robotUuid = this.userToRobot.get(userId);
      const robotSocket = this.robotMap.get(robotUuid);
      if (!robotSocket) robotSocket.send(JSON.stringify({ type: 'error', body: new Error('no robot socket').toString() }));
      robotSocket.send(JSON.stringify({ body: cmd, type: 'cmd' }));
    } else {
      throw new Error('no cmd');
    }
  }

  onInfo(uuid, info) {
    try {
      if (info) {
        const userId = this.robotToUser.get(uuid);
        const userSocket = this.userMap.get(userId);
        if (!userSocket) {
          const robotSocket = this.robotMap.get(uuid);
          robotSocket.send(JSON.stringify({ type: 'infoError', body: new Error('no user socket').toString() }));
        }
        userSocket.send(JSON.stringify({ body: info, type: 'info' }));
      } else {
        throw new Error('no info');
      }
    } catch (err) {
      const robotSocket = this.robotMap.get(uuid);
      robotSocket.send(JSON.stringify({ type: 'infoError', body: err.toString() }));
    }
  }

  onChangeRobot(userId, uuid) {
    this.userToRobot.set(userId, uuid); // todo verify that user can use this robot
    this.robotToUser.set(uuid, userId);
  }

  authRobot(msg, socket) {
    try {
      const uuid = msg.toString();
      if (this.verifyRobotId(uuid)) {
        // todo fix eslint problem
        // eslint-disable-next-line no-param-reassign
        socket.id = uuid;
        this.robotMap.set(uuid, socket);
        socket.on('close', this.onCloseSocket.bind(this, socket));
        this.emit('robotAdd', uuid, socket);
      }
    } catch (err) {
      socket.send(JSON.stringify({ type: 'authRobotError', body: err.toString() }));
    }
  }

  // eslint-disable-next-line no-unused-vars,class-methods-use-this
  verifyRobotId(uuid) {
    return true;
  }

  authUser(msg, socket) {
    try {
      const token = msg.toString();
      if (!token) this.emit('error', new Error('no token'));
      AuthService.verifyAccessToken(token).then((userData) => {
        const { userId } = userData;
        // todo fix id in socket
        // eslint-disable-next-line no-param-reassign
        socket.id = userId;
        this.userMap.set(userData.userId, socket);
        socket.on('close', this.onCloseSocket.bind(this, socket));
        this.emit('userAdd', userId, socket);
      }).catch((err) => err);
    } catch (err) {
      this.emit('error', err);
      socket.send({ type: 'authUserError', body: err.toString() });
      socket.destroy();
    }
  }

  onCloseSocket(socket) { // todo add close check with sending ping to client
    console.log(`uuid ${socket.id}`);
    console.log(`id ${socket.id}`);
    this.userMap.delete(socket.id);
    this.robotMap.delete(socket.id);
  }

  // eslint-disable-next-line class-methods-use-this
  onError(err) {
    console.log(err);
  }
}

module.exports = ConnectorWS;
