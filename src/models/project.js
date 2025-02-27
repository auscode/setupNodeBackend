const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
  {
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: [String],
      required: true,
    },
    subCategory: {
      type: [String],
    },
    budget: {
      min: {
        type: Number,
        required: true,
      },
      max: {
        type: Number,
        required: true,
      },
    },
    skillsRequired: {
      type: [String],
      required: true,
    },
    deadline: {
      type: Date,
      // required: true,
    },
    experienceLevel: {
      type: String,
      enum: ["fresher", "medium", "experienced"],
      default: "medium",
    },
    Attachment: {
      type: String,
    },
    TimelineType: {
      type: String,
      enum: ["small", "medium", "large"],
      default: "medium",
    },
    projectTime: {
      type: [String],
      enum: ["1-3 months", "3-6 months", "6+ months"],
      default: ["1-3 months"],
    },
    status: {
      type: String,
      enum: ["Open", "In Progress", "Completed", "Cancelled"],
      default: "Open",
    },
    address: {
      type: String,
    },
    proposalId: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Proposal",
    }],
  },
  { timestamps: true }
);

projectSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

const Project = mongoose.model("Project", projectSchema);

module.exports = Project;
