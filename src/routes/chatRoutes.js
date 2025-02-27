const express = require('express');
const router = express.Router();
const chatController = require('../controller/chatController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/sendMessage', authMiddleware, chatController.sendMessage);

// Get all messages by chat ID
router.get('/getMessages/:chatId', authMiddleware, chatController.getMessagesByChatId);

// Mark all messages as read
router.put('/markAsRead/:chatId', authMiddleware, chatController.markMessagesAsRead);

router.get("/getAllChats", authMiddleware, chatController.getAllChats);

module.exports = router;


