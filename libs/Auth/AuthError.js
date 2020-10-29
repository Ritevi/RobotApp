class AuthError extends Error {
    constructor(name, code, message,status) {
        super(arguments);
        this.name = name;
        this.code = code;
        this.status = status;
        this.message = message || [name, code].join(" ");
        this.error = {};
    }

    toUser() {
        let { error, ...rest } = this;
        return rest;
    }
}
module.exports = AuthError;