
const express = require('express');
const connectDB = require('./config/db');
// const authRoutes = require('./routes/authRoutes');
// const chatRoutes = require('./routes/chatRoutes');
// const userRoutes = require('./routes/userRoutes');
// const paymentRoutes= require('./routes/paymentRoutes');
const routes = require('./routes/index');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();  // Load environment variables


const app = express();

// Connect to database
connectDB();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());

// Routes

// app.use('/api/auth', authRoutes);
// app.use('/api/chat', chatRoutes);
// app.use('/api/user',userRoutes);
// app.use('/api/payment', paymentRoutes)

app.use("/api", routes);


module.exports = app;
