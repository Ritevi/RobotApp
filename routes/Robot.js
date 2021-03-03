const express = require('express');

const router = express.Router();
const addRobot = require('../controllers/Robot/addRobot');
const getRobot = require('../controllers/Robot/getRobot');
const removeRobot = require('../controllers/Robot/removeRobot');
const onlineRobot = require('../controllers/Robot/onlineRobot');

router.post('/robot', addRobot);
router.get('/robot', getRobot);
router.delete('/robot/:id', removeRobot);
router.get('/onlineRobot', onlineRobot);

module.exports = router;
