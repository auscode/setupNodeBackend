const express = require("express");
const Proposal = require("../models/user");
const Category = require("../models/user");
const User = require("../models/user");
const { uploadSingleImageToCloudflare } = require("../utils/commonFunction");

const sendProposal = async (req, res) => {
  try {
    const {
      userId, // Make sure to pass the userId in the request body to identify which user the proposal belongs to
      proposalName,
      proposalDateandTime,
      proposalRate,
      proposalAddress,
      proposalImage,
      proposalDescription,
    } = req.body;
    const file = req.file;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }
    
    const folderName='single'
    const result = await uploadSingleImageToCloudflare(file,folderName);

    const newProposal = {
      proposalName,
      proposalDateandTime,
      proposalRate,
      proposalAddress,
      proposalImage: result,
      proposalDescription,
    };

    // Push the new proposal into the user's proposals array
    user.proposals.push(newProposal);

    // Save the updated user document
    await user.save();

    res.status(200).json({
      status: "success",
      message: "Proposal updated successfully",
    });
  } catch (err) {
    console.error(err); // Log the error for debugging
    res.status(400).json({
      status: "error",
      message: "Proposal not updated",
    });
  }
};

const getProposalDetails = async (req, res) => {
  try {
    const { user_id } = req.body;
    const authId = req.user;
    if (user_id === authId) {
      const categories = await Category.find();
      const proposals = await Proposal.find();

      res.status(200).json({
        status: "success",
        categoryDetails: categories,
        proposalDetails: proposals,
      });
    } else {
      res.status(400).json({
        status: "error",
        message: "proposalDetails Not Updated",
      });
    }
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: "Server Error",
    });
  }
};

module.exports = { sendProposal, getProposalDetails };
