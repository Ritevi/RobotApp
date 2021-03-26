const express = require('express');
const { container } = require('../di-setup');

const router = express.Router();
const addRobot = require('../controllers/Robot/addRobot');
const getRobot = require('../controllers/Robot/getRobot');
const removeRobot = require('../controllers/Robot/removeRobot');
const onlineRobot = require('../controllers/Robot/onlineRobot');
const authMiddleware = require('../middlewares/Auth');

const AccessStorage = container.resolve('AccessStorage');

router.post('/robot', authMiddleware(AccessStorage), addRobot);
router.get('/robot', authMiddleware(AccessStorage), getRobot);
router.delete('/robot/:id', authMiddleware(AccessStorage), removeRobot);
router.get('/onlineRobot', authMiddleware(AccessStorage), onlineRobot);

module.exports = router;
