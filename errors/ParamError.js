class ParamError extends Error {
  constructor(name, code, message) {
    super(name + code);
    this.name = name;
    this.code = code;
    this.message = message || [name, code].join(' ');
    this.error = {};
  }

  toUser() {
    const { error, ...rest } = this;
    return rest;
  }
}
module.exports = ParamError;
