const express = require('express');
const logger = require('morgan');
const { passport } = require('./libs/passport');
const {
  Auth, VkAuth, Robot, Debug,
} = require('./routes');
const ErrorHandler = require('./middlewares/ErrorHandler');
const NotFound = require('./middlewares/NotFount');

class Server {
  constructor() {
    this.app = express();
    this.setup();
  }

  setup() {
    if (process.env.ENV !== 'test') {
      this.app.use(logger(process.env.ENV));
    }

    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: false }));

    this.app.use(passport.initialize());

    this.app.use('/', VkAuth);
    this.app.use('/auth', Auth);
    this.app.use('/robot', Robot);
    this.app.use('/debug', Debug);

    this.app.use(ErrorHandler);
    this.app.use(NotFound);
  }

  run(port) {
    this.server = this.app.listen(port, () => {
      console.log(`server running on port ${port}`);
    });
  }

  set(settings, value) {
    this.app.set(settings, value);
  }

  stop(done) {
    this.server.close(done);
  }

  getExpress() {
    return this.app;
  }
}

module.exports = Server;
