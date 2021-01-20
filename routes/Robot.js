const express = require('express');
const router = express.Router();
const addRobot = require('../controllers/Robot/addRobot');
const getRobot = require('../controllers/Robot/getRobot');
const removeRobot = require('../controllers/Robot/removeRobot');


router.post('/robot', addRobot);
router.get('/robot', getRobot);
router.delete('/robot/:id', removeRobot);


module.exports = router;
