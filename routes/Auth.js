const express = require('express');
const { container } = require('../di-setup');

const router = express.Router();
const loginController = require('../controllers/Auth/Login');
const refreshController = require('../controllers/Auth/RefreshTokens');
const registerController = require('../controllers/Auth/Register');
const activateController = require('../controllers/Auth/activateProfile');
const authMiddleware = require('../middlewares/Auth');
const { loginMiddleware, registerMiddleware, refreshTokenMiddleware } = require('../middlewares/Validation/Auth');

const AuthService = container.resolve('AuthService');
const AccessStorage = container.resolve('AccessStorage');

router.post('/login', loginMiddleware, loginController(AuthService));

router.post('/register', registerMiddleware, registerController(AuthService));

router.post('/refresh', refreshTokenMiddleware, refreshController(AuthService));

router.get('/activateProfile/:emailUUID', activateController(AuthService));

router.get('/private', authMiddleware(AccessStorage), (req, res) => {
  res.json({ message: 'hi ksta' });
});

module.exports = router;
