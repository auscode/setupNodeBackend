require('dotenv').config();
const http = require('http');
const app = require('./src/app');
const socketio = require('socket.io');

const PORT = process.env.PORT || 5000;

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.io with the server
const io = socketio(server, {
  cors: {
    origin: process.env.ORIGIN, // Adjust the origin to allow CORS from your frontend
    methods: ["GET", "POST"],
  }
});

// Handle socket connection
io.on('connection', (socket) => {
  console.log('New WebSocket connection');

  // Handle joining a room
  socket.on('join', ({ roomId }, callback) => {
    if (!roomId) {
      return callback('Room ID is required.');
    }
    socket.join(roomId);
    console.log(`User joined room ${roomId}`);
    callback();
  });

  // Handle sending a message
  socket.on('sendMessage', ({ recipientId, senderId, message }, callback) => {
    if (!recipientId || !senderId || !message) {
      return callback('Recipient ID, Sender ID, and message are required.');
    }
    io.to(recipientId).emit('message', { senderId, message });
    console.log(`Message sent from ${senderId} to ${recipientId}: ${message}`);
    callback();
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

// Start the server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Make io instance available in app.js
app.set('io', io);

module.exports = { server, io };
