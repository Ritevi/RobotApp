const express = require('express');
const router = express.Router();
const addRobot = require('../controllers/Robot/addRobot');

router.post('/robot', addRobot);

module.exports = router;
