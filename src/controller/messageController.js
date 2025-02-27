// const { initializeApp } = require("firebase/app");
// const { getMessaging, getToken } = require("firebase/messaging");
const Conversation = require("../models/conversation.js");
const Message = require("../models/message.js");
const User = require("../models/user.js");
const { getReceiverSocketId, io } = require("../socket/socket.js");
const mongoose = require('mongoose');

// Send message
const sendMessage = async (req, res) => {
  try {
    const { message } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user.id;

    if (!message) return res.status(400).json({ error: "Message content is required" });

    const [sender, receiver] = await Promise.all([
      User.findById(senderId),
      User.findById(receiverId)
    ]);

    if (!sender) return res.status(404).json({ error: "Sender not found" });
    if (!receiver) return res.status(404).json({ error: "Receiver not found" });

    const senderConnection = sender.connections.find(conn => conn.userId === receiverId);
    const receiverConnection = receiver.connections.find(conn => conn.userId === senderId);

    const isConnected = (senderConnection?.status === 'accepted') || (receiverConnection?.status === 'accepted');
    const messageStatus = isConnected ? 'accepted' : 'pending';

    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] }
    });

    if (!conversation) {
      conversation = new Conversation({
        participants: [senderId, receiverId],
        messages: []
      });
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      message,
      status: messageStatus,
      isJobProvider: sender.isJobProvider
    });

    conversation.messages.push(newMessage._id);
    await Promise.all([conversation.save(), newMessage.save()]);

    if (isConnected) {
      await Message.updateMany(
        { senderId, receiverId, status: "pending" },
        { $set: { status: "accepted" } }
      );
      await Message.updateMany(
        { senderId: receiverId, receiverId: senderId, status: "pending", isJobProvider: sender.isJobProvider },
        { $set: { status: "accepted" } }
      );
    }

    const receiverSocketId = getReceiverSocketId(receiverId);
	console.log(receiverSocketId)
    if (receiverSocketId) io.to(receiverSocketId).emit("newMessage", newMessage);

    res.status(201).json(newMessage);
  } catch (error) {
    console.log("Error in sendMessage controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Send connection request
const sendConnectionRequest = async (req, res) => {
	try {
	  const senderId = req.user.id;
	  const { receiverId } = req.body;
	  // Check if receiverId exists in the request body
	  if (!receiverId) {
		return res.status(400).json({ status: false, message: "Receiver userId is required" });
	  }
  
	  // Check if the sender and receiver are the same
	  if (senderId === receiverId) {
		return res.status(400).json({ status: false, message: "You cannot send a connection request to yourself" });
	  }
  
	  // Check if the receiver exists in the database
	  const receiver = await User.findById(receiverId);
	  if (!receiver) {
		return res.status(404).json({ status: false, message: "Receiver not found" });
	  }
  
	  // Check if the sender has already sent a request or is already connected
	  const existingConnection = receiver.connections.find(
		(connection) => connection.userId.toString() === senderId
	  );
  
	  if (existingConnection) {
		if (existingConnection.status === "pending") {
		  return res.status(400).json({ status: false, message: "Connection request already sent" });
		} else if (existingConnection.status === "accepted") {
		  return res.status(400).json({ status: false, message: "You are already connected with this user" });
		}
	  }
  
	  // Add the connection request with 'pending' status
	  await User.findByIdAndUpdate(receiverId, {
		$push: { connections: { userId: senderId, status: 'pending' } }
	  });
	  await User.findByIdAndUpdate(senderId, {
		$push: { connections: { userId: receiverId, status: 'pending' } }
	  });
  
	  res.status(200).json({ status: true, message: "Connection request sent successfully" });
	} catch (error) {
	  console.log("Error in sendConnectionRequest controller: ", error.message);
	  res.status(500).json({ status: false, message: "Internal server error" });
	}
  };
  

// Accept connection request
const acceptConnectionRequest = async (req, res) => {
	try {
	  const receiverId = req.user.id;
	  const { senderId } = req.body;
  
	  // Check if senderId exists in the request body
	  if (!senderId) {
		return res.status(400).json({ status: false, message: "Sender userId is required" });
	  }
  
	  // Check if the sender and receiver are the same
	  if (receiverId === senderId) {
		return res.status(400).json({ status: false, message: "You cannot accept a connection request from yourself" });
	  }
  
	  // Check if the connection request exists and is in pending state
	  const receiver = await User.findById(receiverId);
	  const sender = await User.findById(senderId);
  
	  if (!receiver) {
		return res.status(404).json({ status: false, message: "Receiver not found" });
	  }
  
	  if (!sender) {
		return res.status(404).json({ status: false, message: "Sender not found" });
	  }
  
	  // Check if the connection is already accepted
	  const connection = receiver.connections.find(
		(conn) => conn.userId.toString() === senderId
	  );
  
	  if (!connection) {
		return res.status(404).json({ status: false, message: "Connection request not found" });
	  }
  
	  if (connection.status === "accepted") {
		return res.status(400).json({ status: false, message: "Connection request is already accepted" });
	  }
  
	  if (connection.status !== "pending") {
		return res.status(400).json({ status: false, message: "No pending connection request to accept" });
	  }
  
	  // Accept the connection for both users
	  const [receiverUpdate, senderUpdate] = await Promise.all([
		User.updateOne(
		  { _id: receiverId, "connections.userId": senderId },
		  { $set: { "connections.$.status": "accepted" } }
		),
		User.updateOne(
		  { _id: senderId, "connections.userId": receiverId },
		  { $set: { "connections.$.status": "accepted" } }
		)
	  ]);
  
	  // Check if the update was successful
	  if (receiverUpdate.nModified === 0 || senderUpdate.nModified === 0) {
		return res.status(400).json({ status: false, message: "Failed to update connection status" });
	  }
  
	  // Update the message statuses related to the connection
	  await Promise.all([
		Message.updateMany(
		  { senderId, receiverId, status: "pending" },
		  { $set: { status: "connected" } }
		),
		Message.updateMany(
		  { senderId: receiverId, receiverId: senderId, status: "pending" },
		  { $set: { status: "connected" } }
		)
	  ]);
  
	  res.status(200).json({ status: true, message: "Connection request accepted and messages updated" });
	} catch (error) {
	  console.log("Error in acceptConnectionRequest controller: ", error.message);
	  res.status(500).json({ status: false, message: "Internal server error" });
	}
  };
  

  // Get list of connections with populated user details
  const getConnections = async (req, res) => {
	try {
	  
	  const userId = req.user.id; // Assumed to be coming from middleware
  
	  // Check if userId is a valid ObjectId
	  if (!mongoose.Types.ObjectId.isValid(userId)) {
		return res.status(400).json({ status: false, message: 'Invalid User ID' });
	  }
  
	  // Correct way to instantiate ObjectId
	//   const userObjectId = new mongoose.Types.ObjectId(userId);
  
	  // Find the user by their ID and populate the connections' userId with user details
	  const user = await User.findById(userId).populate({
		path: 'connections.userId'
	  });
	  // Handle case when user is not found
	  if (!user) {
		return res.status(404).json({ status: false, message: 'User not found' });
	  }
  
	  // Return the populated connections
	  res.status(200).json({
		status: true,
		message: 'Connections retrieved successfully',
		data: user.connections, // Return the list of connections with populated details
	  });
	} catch (error) {
	  console.error("Error in getConnections API: ", error.message);
	  res.status(500).json({ status: false, message: 'Internal server error' });
	}
  };
  

// Get messages
const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const senderId = req.user.id;

    const conversation = await Conversation.findOne({
      participants: { $all: [senderId, userToChatId] }
    }).populate("messages");

    res.status(200).json(conversation ? conversation.messages : []);
  } catch (error) {
    console.log("Error in getMessages controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Accept message
const acceptMessage = async (req, res) => {
  try {
    const { id: messageId } = req.params;

    const message = await Message.findById(messageId);
    if (!message) return res.status(404).json({ error: "Message not found" });

    message.status = 'connected';
    await message.save();

    res.status(200).json(message);
  } catch (error) {
    console.log("Error in acceptMessage controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  sendMessage,
  getMessages,
  acceptMessage,
  sendConnectionRequest,
  acceptConnectionRequest,
  getConnections
};
