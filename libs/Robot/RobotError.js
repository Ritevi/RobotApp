class RobotError extends Error {
  constructor(name, code, message, status) {
    super(name + code);
    this.name = name;
    this.code = code;
    this.status = status;
    this.message = message || [name, code].join(' ');
    this.error = {};
  }

  toUser() {
    const { error, ...rest } = this;
    return rest;
  }
}
module.exports = RobotError;
