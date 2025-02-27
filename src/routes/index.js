// routes/index.js
const express = require("express");
const router = express.Router();

// Import Routes
const categoryRoutes = require("./categoryRoutes");
const proposalRoutes = require("./proposalRoutes");
const userRoutes = require("./userRoutes");
const projectProposalRoutes = require("./projectProposalRoutes");
const authRoutes = require("./authRoutes");
const chatRoutes = require("./chatRoutes");
const projectRoutes = require("./projectRoutes");
const paymentRoutes= require('./paymentRoutes');
const notificationRoutes = require("./notificationRoutes");
const messageRoutes = require("./messageRoute")
const infoRoutes =  require("./infoRoutes");

// Use Routes
router.use("/auth", authRoutes);
router.use("/chat", chatRoutes);
router.use("/user", userRoutes);
router.use("/projects", projectRoutes);
router.use('/payment', paymentRoutes)
router.use("/", categoryRoutes);
router.use("/", proposalRoutes);
router.use("/", projectProposalRoutes);
router.use("/notifications", notificationRoutes);
router.use("/message", messageRoutes)
router.use("/info", infoRoutes)

module.exports = router;
