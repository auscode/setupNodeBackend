const Chat = require("../models/chat");
const User = require("../models/user");

exports.sendMessage = async (req, res) => {
  const { recipientId, message } = req.body;
  const senderId = req.user.id; // Assuming you have the sender's ID from the auth middleware

  if (!recipientId || !message) {
    return res
      .status(400)
      .json({ status: "error", message: "Missing required fields" });
  }

  try {
    let chat = await Chat.findOne({ senderId, recipientId });

    if (!chat) {
      chat = new Chat({ userId: senderId, recipientId, messages: [] });
    }

    chat.messages.push({ senderId, message });
    await chat.save();

    // Emit the message to the room using Socket.io
    req.app
      .get("io")
      .to(recipientId.toString())
      .emit("message", { senderId, message });

    res
      .status(200)
      .json({ status: 200, message: "Message sent successfully", data: chat });
  } catch (err) {
    console.error("Error sending message:", err);
    res.status(500).json({ status: "error", message: "Message not sent" });
  }
};

exports.getMessagesByChatId = async (req, res) => {
  const { chatId } = req.params;

  try {
    const chat = await Chat.findById(chatId).populate(
      "messages.senderId",
      "name"
    ); // Optional: populate sender details

    if (!chat) {
      return res.status(404).json({ status: 200, message: "Chat not found" });
    }

    return res
      .status(200)
      .json({ status: 200, messages: "success", data: chat.messages });
  } catch (err) {
    console.error("Error fetching messages:", err);
    return res
      .status(500)
      .json({ status: 500, message: "Internal Server Error" });
  }
};

exports.markMessagesAsRead = async (req, res) => {
  const { chatId } = req.params;
  console.log("1");

  try {
    const chat = await Chat.findById(chatId);

    if (!chat) {
      return res.status(404).json({ status: 404, message: "Chat not found" });
    }

    chat.messages.forEach((msg) => {
      msg.read = true;
    });

    await chat.save();
    return res
      .status(200)
      .json({
        status: 200,
        message: "All messages marked as read",
        data: chat,
      });
  } catch (err) {
    console.error("Error marking messages as read:", err);
    return res
      .status(500)
      .json({ status: 500, message: "Internal Server Error" });
  }
};

exports.getAllChats = async (req, res) => {
  const userId = req.user.id;

  try {
    // Find all chats where the user is either the sender (userId) or recipient (recipientId)
    const chats = await Chat.find({
      $or: [{ userId }, { recipientId: userId }],
    })
      .populate("userId", "name email")
      .populate("recipientId", "name email")
      .populate("messages.senderId", "name");

    if (!chats || chats.length === 0) {
      return res.status(404).json({ status: 404, message: "No chats found" });
    }

    return res
      .status(200)
      .json({ status: 200, message: "success", data: chats });
  } catch (err) {
    console.error("Error fetching chats:", err);
    return res
      .status(500)
      .json({ status: 500, message: "Internal Server Error" });
  }
};
