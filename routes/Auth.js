const express = require('express');

const router = express.Router();
const loginController = require('../controllers/Auth/Login');
const refreshController = require('../controllers/Auth/RefreshTokens');
const registerController = require('../controllers/Auth/Register');
const authMiddleware = require('../middlewares/Auth');

router.post('/login', loginController);

router.post('/register', registerController);

router.post('/refresh', refreshController);

router.get('/private', authMiddleware, (req, res) => {
  res.json({ message: 'sosi jopu' });
});

module.exports = router;
