class ParamError extends Error {
    constructor(name, code, message) {
        super(arguments);
        this.name = name;
        this.code = code;
        this.message = message || [name, code].join(" ");
        this.error = {};
    }

    toUser() {
        let { error, ...rest } = this;
        return rest;
    }
}
module.exports = ParamError;