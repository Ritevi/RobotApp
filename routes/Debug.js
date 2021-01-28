const express = require('express');
const router = express.Router();
const getConnectRobots = require('../controllers/Debug/getConnectRobots');
const getConnectUsers = require('../controllers/Debug/getConnectUsers');
const getConnect = require('../controllers/Debug/getConnect');

router.get('/getConnectRobots', getConnectRobots);
router.get('/getConnectUsers', getConnectUsers);
router.get('/getConnect', getConnect);

module.exports = router;
