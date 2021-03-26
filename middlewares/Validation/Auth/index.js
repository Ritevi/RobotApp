const login = require('./Login');
const refreshToken = require('./RefreshTokens');
const register = require('./Register');

exports.loginMiddleware = login;
exports.refreshTokenMiddleware = refreshToken;
exports.registerMiddleware = register;
