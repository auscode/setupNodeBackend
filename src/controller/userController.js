// Create User Details
const mongoose = require("mongoose");
const UserDetails = require("../models/userDetails");
const user = require("../models/user");
const projectDetails = require("../models/project");
const proposalsDetails = require("../models/proposal");
const moment = require("moment");
const { paginationData } = require("../utils/pagination");
const {uploadSingleImageToCloudflare} = require("../utils/commonFunction");


exports.createUserDetails = async (req, res) => {
  try {
    const userId = req.user.id;

    // Check if user ID is valid
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        status: 400,
        message: "Invalid user ID",
      });
    }

    // Handle profile image upload if a file is provided
    let profileImageUrl = null;
    if (req.file) {
      try {
        // Upload image to Cloudflare and get the URL
        profileImageUrl = await uploadSingleImageToCloudflare(req.file);
      } catch (error) {
        return res.status(500).json({
          status: 500,
          message: "Error uploading image to Cloudflare",
          error: error.message,
        });
      }
    }

    // If user is a client, remove personalProjects from request body
    if (req.user.isAdmin) {
      delete req.body.personalProjects;
    }

    // If user is not an admin and personalProjects is provided, process it
    if (!req.user.isAdmin && req.body.personalProjects) {
      // Ensure that personalProjects is an array
      const personalProjects = Array.isArray(req.body.personalProjects)
        ? req.body.personalProjects
        : [req.body.personalProjects];

      // Validate each personal project
      for (const project of personalProjects) {
        const { projectName, description, startDate } = project;

        if (!projectName || !description || !startDate) {
          return res.status(400).json({
            status: 400,
            message: "Incomplete personal project details",
          });
        }
      }

      // Map through the personalProjects to ensure isOngoing is a boolean
      const formattedProjects = personalProjects.map((project) => ({
        ...project,
        isOngoing: project.isOngoing === "true" || project.isOngoing === true,
      }));

      // Create a new UserDetails entry with personal projects
      const userDetails = new UserDetails({
        user: userId,
        profileImage: profileImageUrl,
        personalProjects: formattedProjects,
        ...req.body, // Spread other details from request body
      });

      await userDetails.save();

      return res.status(201).json({
        status: 201,
        message: "User details and personal projects created successfully",
        data: userDetails,
      });
    } else {
      // Create user details without personal projects
      const userDetails = new UserDetails({
        user: userId,
        profileImage: profileImageUrl,
        ...req.body, // Spread other details from request body
      });

      await userDetails.save();

      return res.status(201).json({
        status: 201,
        message: "User details created successfully",
        data: userDetails,
      });
    }
  } catch (error) {
    // Handle any errors
    res.status(500).json({
      status: 500,
      message: "Error creating user details or personal project",
      error: error.message,
    });
  }
};


exports.getUserDetails = async (req, res) => {
  try {
    // Fetch user ID from request object set by AuthMiddleware
    const userId = req.user.id;

    // Find the user details by userId
    const userDetails = await UserDetails.findOne({ user: userId }).populate('user');

    // If user details not found, return a 404 error
    if (!userDetails) {
      return res.status(404).json({
        status: 404,
        message: "User details not found",
      });
    }

    // Return the user details in the response
    res.status(200).json({
      status: 200,
      message:"success",
      data:{
        userDetails
      }
    });
  } catch (error) {
    // Handle any errors
    res.status(500).json({
      status: 500,
      message: "Internal server Error",
      error: error.message,
    });
  }
};


// Update User Details by userId
exports.updateUserDetails = async (req, res) => {
  try {
    // Fetch user ID from request object set by AuthMiddleware
    const userId = req.user.id;
    
    // Handle profile image upload if a file is provided
    let profileImageUrl = null;
    if (req.file) {
      try {
        // Upload image to Cloudflare and get the URL
        profileImageUrl = await uploadSingleImageToCloudflare(req.file);
      } catch (error) {
        return res.status(500).json({
          status: 500,
          message: "Error uploading image to Cloudflare",
          error: error.message,
        });
      }
    }

    // Prepare update object
    if (req.user.isAdmin) {
      delete req.body.personalProjects;
    }
    
    const updateData = { ...req.body };
    if (profileImageUrl) {
      updateData.profileImage = profileImageUrl;
    }

    if (req.body.userName) {
      await user.findOneAndUpdate(
        { _id: userId },
        { userName: req.body.userName },
        { new: true, runValidators: true }
      );
    }
    const updatedUser = await user.findById(userId);

    // Update the user details
    const updatedUserDetails = await UserDetails.findOneAndUpdate(
      { user: userId },
      updateData, // The update object will include profileImageUrl if it's defined
      { new: true, runValidators: true } // Return the updated document and validate
    );

    // If user details not found, return a 404 error
    if (!updatedUserDetails) {
      return res.status(404).json({
        status: 404,
        message: "User details not found",
      });
    }

    // Return the updated user details in the response
    res.status(200).json({
      stataus: 200,
      message: "User details updated successfully",
      data: { updatedUserDetails, userName: updatedUser.userName }
    });
  } catch (error) {
    // Handle any errors
    res.status(500).json({
      status: 500,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Delete User Details by userId
exports.deleteUserDetails = async (req, res) => {
  try {
    // Fetch user ID from request object set by AuthMiddleware
    const userId = req.user.id;

    // Delete the user details
    const result = await UserDetails.deleteOne({ user: userId });

    // If no document was deleted, return a 404 error
    if (result.deletedCount === 0) {
      return res.status(404).json({
        status: false,
        message: "User details not found",
      });
    }

    // Return success message
    res.status(200).json({
      status: 200,
      message: "User details deleted successfully",
    });
  } catch (error) {
    // Handle any errors
    res.status(500).json({
      status: 500,
      message: "Internal server Error",
      error: error.message,
    });
  }
};

exports.allUsers = async (req, res) => {
  try {
    const { status } = req.body;
    if (!req.user.isAdmin) {
      return res.status(403).json({ status:403, message: "Only admin get see all users" });
    }
    const today = moment();
    const lastDayOfMonth = today.clone().endOf("month");
    const startDate = lastDayOfMonth.clone().subtract(9, "days").startOf("day");

    const condition = {};
    if (status === "active") {
      condition.updatedAt = {
        $gte: startDate
      };
    } else if(status == 'unActive') {
      condition.updatedAt = {
        $lt: startDate
      };
    }

    const { offset, limit } = paginationData(req);
    const users = await UserDetails
      .find(condition)
      .skip(offset)
      .limit(limit);
    return res
      .status(200)
      .json({
        status:200,
        message: "Data fetched successfully",
        data:{ users,
        totalUsers: users.length,
        }
      });
  } catch (error) {
    return res.status(500).json({
      status: 500,
      message: "Internal server Error",
      error: error.message,
    });
  }
};

exports.allprojects = async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res
        .status(403)
        .json({status:403, message: "Only admin get see all projects" });
    }

    const { offset, limit } = paginationData(req);
    const projects = await projectDetails.find().skip(offset).limit(limit);
    return res
      .status(200)
      .json({
        status:200,
        message: "Data fetched successfully",
        data: {projects,
        totalProjects: projects.length,
      }
      });
  } catch (error) {
    return res.status(500).json({
      status: 500,
      message: "Internal server Error",
      error: error.message,
    });
  }
};

exports.allproposals = async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res
        .status(403)
        .json({ message: "Only admin get see all projects" });
    }

    const { offset, limit } = paginationData(req);
    const proposals = await proposalsDetails.find().skip(offset).limit(limit);
    return res
      .status(200)
      .json({
        message: "Data fetched successfully",
        data: {proposals,
        totalProposals: proposals.length,}
      });
  } catch (error) {
    return res.status(500).json({
      status: 500,
      message: "Internal server Error",
      error: error.message,
    });
  }
};
