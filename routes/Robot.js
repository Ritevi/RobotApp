const express = require('express');
const router = express.Router();
const subscribeToRobot = require('../controllers/Robot/subscribeToRobot');
const addRobot = require('../controllers/Robot/addRobot');

router.post('/subscribe', subscribeToRobot);
router.post('/robot', addRobot);

module.exports = router;
