const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Reference to the user receiving the notification
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Reference to the user triggering the notification
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project", // Reference to the project for proposal notifications
    },
    proposal: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Proposal", // Reference to the proposal for proposal-related notifications
    },
    type: {
      type: String,
      enum: [
        "ProposalCreated",
        "ProposalUpdated",
        "PaymentApproved",
        "MessageReceived",
        "ProjectStatusChanged",
      ],
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    read: {
      type: Boolean,
      default: false, 
    },
    metadata: {
      type: Object,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);
