const express = require('express');
const { getMessages, sendMessage, acceptMessage, sendConnectionRequest, acceptConnectionRequest,getConnections } = require('../controller/messageController');
const authMiddleware = require('../middlewares/authMiddleware');
const router = express.Router();

router.get('/:id',authMiddleware, getMessages);
router.post('/send/:id', authMiddleware, sendMessage);
// router.post('/accept/:connectionId', protectRoute, acceptConnect);
router.post('/accept/:id', authMiddleware, acceptMessage);

router.post('/connect', authMiddleware, sendConnectionRequest);
router.post('/accept', authMiddleware, acceptConnectionRequest);
router.get('/user/connections', authMiddleware, getConnections);

module.exports = router;
