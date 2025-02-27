const Notification = require("../models/notification");

// Create a new notification
exports.createNotification = async (req, res) => {
  try {
    const { recipient, project, proposal, type, message, metadata } = req.body;
    const sender = req.user.id;

    const notification = new Notification({
      recipient,
      sender,
      project,
      proposal,
      type,
      message,
      metadata,
    });

    await notification.save();
    res.status(201).json({
      status: 201,
      message: "Notification created successfully",
      data: notification,
    });
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// Update a notification
exports.updateNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const notification = await Notification.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    if (!notification) {
      return res.status(404).json({
        status: 404,
        message: "Notification not found",
      });
    }

    res.status(200).json({
      status: 200,
      message: "Notification updated successfully",
      data: notification,
    });
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// Delete a notification
exports.deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findByIdAndDelete(id);

    if (!notification) {
      return res.status(404).json({
        status: 404,
        message: "Notification not found",
      });
    }

    res.status(200).json({
      status: 200,
      message: "Notification deleted successfully",
      data: notification,
    });
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// Mark a notification as read
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findByIdAndUpdate(
      id,
      { read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Notification marked as read",
      data: notification,
    });
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// Mark all notifications as read for the current user
exports.markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;

    // Update all unread notifications for the current user
    const result = await Notification.updateMany(
      { recipient: userId, read: false }, // Only update unread notifications for the user
      { read: true }, // Mark them as read
      { multi: true } // Apply update to all matching documents
    );

    if (result.nModified === 0) {
      return res.status(404).json({
        status:404,
        message: "No unread notifications found",
      });
    }

    res.status(200).json({
      status:200,
      message: "All notifications marked as read",
      modifiedCount: result.nModified,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 500,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};
exports.getNotificationById = async (req, res) => {
  try {
    const { id } = req.params; // Notification ID from the request parameters

    // Find the notification by its ID
    const notification = await Notification.findById(id);

    if (!notification) {
      return res.status(404).json({
        status:404,
        message: "Notification not found",
      });
    }

    res.status(200).json({
      status:200,
      message: "Notification retrieved successfully",
      data: notification,
    });
  } catch (error) {
    console.error("Error retrieving notification:", error);
    res.status(500).json({
      status: 500,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// Get all notifications for a user
exports.getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const notifications = await Notification.find({
      recipient: userId,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      status:200,
      message:"success",
      data: notifications,
    });
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

exports.clearNotifications = async (req, res) => {
  try {
    const userId = req.user.id; // Assuming req.user contains the authenticated user's ID

    // Delete all notifications for the current user
    const result = await Notification.deleteMany({ recipient: userId });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: "No notifications found to delete",
      });
    }

    res.status(200).json({
      success: true,
      message: "All notifications cleared successfully",
      data: {
        deletedCount: result.deletedCount
      },
    });
  } catch (error) {
    console.error("Error clearing notifications:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};
