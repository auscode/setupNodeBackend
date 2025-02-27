const express = require("express");
const router = express.Router();
const notificationController = require("../controller/notificationController");
const authMiddleware = require("../middlewares/authMiddleware");


// Mark all as read notifications for user
router.put("/markAllAsRead",authMiddleware,notificationController.markAllAsRead);

router.delete("/clear",authMiddleware,notificationController.clearNotifications);

// Create a notification
router.post("/", authMiddleware, notificationController.createNotification);

// Update a notification by ID
router.put("/:id", authMiddleware, notificationController.updateNotification);

// Delete a notification by ID
router.delete("/:id",  authMiddleware,  notificationController.deleteNotification);

// Mark a specific notification as read by ID
router.put("/read/:id", authMiddleware, notificationController.markAsRead);

// Get all notifications for a specific user
router.get("/", authMiddleware, notificationController.getNotifications);
// Get specific notifications 
router.get("/:id", authMiddleware, notificationController.getNotificationById);

module.exports = router;
