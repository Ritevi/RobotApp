const Server = require('./app.js');
const Connector = require('./libs/Connector');
const config = require('./config');
const { container } = require('./di-setup');

process.on('unhandledRejection', (reason) => {
  throw reason;
});

process.on('uncaughtException', (error) => {
  console.error(error);
});
const server = new Server(config.port);
const connector = new Connector({
  wsOptions: { server: server.server, ...config.get('webSocket') },
  AccessStorage: container.resolve('AccessStorage'),
});

server.set('robotMap', connector.robotMap);
server.set('userMap', connector.userMap);
server.set('userToRobot', connector.userToRobot);
server.set('robotToUser', connector.robotToUser);

server.run(config.get('port'));
