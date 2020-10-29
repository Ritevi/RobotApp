const express = require('express');
const router = express.Router();
const addRobot = require('../controllers/Robot/subscribeToRobot');

router.post('/', addRobot);


module.exports = router;
