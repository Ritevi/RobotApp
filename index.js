const Server = require('./app.js');
const Connector = require('./libs/Connector');
const config = require('./config');

process.on('unhandledRejection', (reason) => {
  throw reason;
});

process.on('uncaughtException', () => {
  // console.error(error);
  // todo add error management
});

const server = new Server(config.port);
const connector = new (Connector)({ server: server.server, ...config.get('webSocket') });

server.set('robotMap', connector.robotMap);
server.set('userMap', connector.userMap);
server.set('userToRobot', connector.userToRobot);
server.set('robotToUser', connector.robotToUser); // todo change the way you access connector from app

server.run(config.get('port'));
