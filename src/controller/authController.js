const User = require("../models/user");
const UserDetails = require("../models/userDetails.js");
const Project = require("../models/project.js");
const Payment = require("../models/payment.js");
const Proposal = require("../models/proposal.js");
const bcrypt = require("bcryptjs");
const { generateToken } = require("../utils/jwt");
const { sendEmail } = require("../config/email.js");
const {
  uploadSingleImageToCloudflare,
  uploadMultipleImagesToCloudflare,
} = require("../utils/commonFunction.js");
const salt = bcrypt.genSalt(10);

// Registration
exports.registerUser = async (req, res) => {
  try {
    const { userName, email, password, isClient, isAdmin } = req.body;

    const trimmedUserName = userName.trim();
    const trimmedEmail = email.trim().toLowerCase();

    // Check if user already exists by email
    const userExists = await User.findOne({ email: trimmedEmail });

    if (userExists) {
      return res.status(409).json({
        status: 409,
        message: "User with this email already exists",
      });
    }

    // Create a new user
    const newUser = new User({
      userName: trimmedUserName,
      email: trimmedEmail,
      password : bcrypt.hashSync(password, 10),
      isClient,
      isAdmin,
    });

    await newUser.save();

    const token = generateToken(newUser);

    res.status(201).json({
      status: 201,
      message: "User registered successfully",
      data: { token, newUser },
    });
  } catch (err) {
    console.error("Error during registration:", err); // Add this line for debugging
    if (err.code === 11000) {
      const field = Object.keys(err.keyValue)[0];
      const value = err.keyValue[field];

      return res.status(400).json({
        status: 400,
        message: `The ${field} "${value}" is already in use. Please choose another.`,
      });
    }

    res.status(500).json({
      status: 500,
      message: "Registration Failed",
      error: err.message,
    });
  }
};


exports.registerProvider = async (req, res) => {
  try {
    const { userName, email, password, phoneNumber, isAdmin } = req.body;

    const trimmedProviderName = userName.trim();
    const trimmedEmail = email.trim().toLowerCase();

    // Check if user already exists by email
    const providerExists = await User.findOne({ email: trimmedEmail });

    if (providerExists) {
      return res.status(409).json({
        status: 409,
        message: "Provider with this email already exists",
      });
    }

    let profileImg = "";
    if(req.file){
       profileImg = await uploadSingleImageToCloudflare(req.file);
    }
    
    // Create a new user
    const newUser = new User({
      userName: trimmedProviderName,
      email: trimmedEmail,
      password: bcrypt.hashSync(password, 10),
      isClient:true,
      isAdmin,
      phoneNumber,
      profileImg
    });

    await newUser.save();

    const token = generateToken(newUser);

    res.status(201).json({
      status: 201,
      message: "Provider registered successfully",
      data: { token, newUser },
    });
  } catch (err) {
    console.error("Error during registration:", err); // Add this line for debugging
    if (err.code === 11000) {
      const field = Object.keys(err.keyValue)[0];
      const value = err.keyValue[field];

      return res.status(400).json({
        status: 400,
        message: `The ${field} "${value}" is already in use. Please choose another.`,
      });
    }

    res.status(500).json({
      status: 500,
      message: "Registration Failed",
      error: err.message,
    });
  }
};
// Login
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    let user = await User.findOne({ email });

    if (!user) {
      return res
        .status(400)
        .json({ status: 400, message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    console.log("Password match result:", isMatch);
    if (!isMatch) {
      return res
        .status(400)
        .json({ status: 400, message: "Invalid email or password" });
    }

    // Generate the token
    const token = generateToken(user);

    // Fetch user details
    const userDetails = await UserDetails.findOne({ user: user._id }).exec();

    // If userDetails are not found, set it to an empty object
    user = await User.findByIdAndUpdate(
      user._id,
      { updatedAt: new Date() },
      { new: true }
    );

    const userDetailsResponse = userDetails ? userDetails.toObject() : {};
    // Prepare the response
    res.status(200).json({
      status: 200,
      message: "Login successful",
      data:{
        token,
        user: {
        id: user._id,
        userName: user.userName,
        email: user.email,
        isClient: user.isClient,
        profileImg: user.profileImg,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        firstName: userDetailsResponse.firstName || "",
        lastName: userDetailsResponse.lastName || "",
        address: userDetailsResponse.address || "",
        city: userDetailsResponse.city || "",
        pincode: userDetailsResponse.pincode || "",
        country: userDetailsResponse.country || "",
        title: userDetailsResponse.title || "",
        experience: userDetailsResponse.experience || [],
        education: userDetailsResponse.education || [],
        skills: userDetailsResponse.skills || [],
        languages: userDetailsResponse.languages || [],
        profileDescription: userDetailsResponse.profileDescription || "",
        hourlyRate: userDetailsResponse.hourlyRate || null,
        phoneNumber: userDetailsResponse.phoneNumber || "",
      }},
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ status: "error", message: "Server error" });
  }
};

// change Password
exports.changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user.id; // Get user ID from middleware

  try {
    // Find the user by ID
    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(400)
        .json({ status: "error", message: "User not found" });
    }

    // Check if the current password matches the hashed password in the database

    const isMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isMatch) {
      return res
        .status(400)
        .json({ status: "error", message: "Incorrect current password" });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    // Save the updated user with the new password
    await user.save();
    console.log("Updated user password:", user.password); // Add this after hashing and before saving

    res
      .status(200)
      .json({
        status: 200,
        message: "Password updated successfully",
        data: user,
      });
  } catch (error) {
    console.error("Error in changePassword:", error);
    res
      .status(500)
      .json({ status: 500, message: "Internal Server Error", error: error.message });
  }
};

// sendResetPasswordOTP
exports.sendResetPasswordOTP = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ status: 400, message: "User not found" });
    }

    // Generate a 4-digit OTP using Math.random
    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    user.resetPasswordOTP = otp;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    const subject = "Reset Password OTP";
    const recipientEmail = `${user.email}`;

    const body = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Password OTP</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
            color: #333333;
        }
        .container {
            width: 100%;
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            padding: 20px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        .header {
            background-color: #007bff;
            padding: 20px;
            text-align: center;
            color: white;
            font-size: 24px;
            font-weight: bold;
        }
        .content {
            padding: 20px;
            text-align: center;
        }
        .otp-code {
            font-size: 32px;
            font-weight: bold;
            color: #007bff;
            margin: 20px 0;
            letter-spacing: 4px;
        }
        .footer {
            text-align: center;
            padding: 20px;
            font-size: 14px;
            color: #666666;
        }
        @media (max-width: 600px) {
            .header, .content, .footer {
                padding: 10px;
            }
            .otp-code {
                font-size: 28px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            Reset Your Password
        </div>
        <div class="content">
            <p>Dear ${user.userName || "User"},</p>
            <p>Your OTP for resetting your password is:</p>
            <div class="otp-code">${otp}</div>
            <p>This OTP is valid for 60 minutes.</p>
        </div>
        <div class="footer">
            <p>If you didn't request a password reset, please ignore this email.</p>
        </div>
    </div>
</body>
</html>
`;

    await sendEmail(subject, recipientEmail, body);

    res.status(200).json({
      status: 200,
      message: "OTP sent to email",
      data:{
        email: user.email,
        otp:otp,
      }
    });
  } catch (error) {
    console.error("Error in sendResetPasswordOTP:", error);
    res
      .status(500)
      .json({ status: 500, message: "Internal Server Error", error: error.message });
  }
};

//verifyResetPasswordOTP

exports.verifyResetPasswordOTP = async (req, res) => {
  const { email, otp } = req.body;
  try {
    const user = await User.findOne({ email, resetPasswordOTP: otp });
    if (!user || Date.now() > user.resetPasswordExpires) {
      return res
        .status(400)
        .json({ status: 400, message: "Invalid or expired OTP" });
    }

    res
      .status(200)
      .json({ status: 200, message: "OTP verified successfully"});
  } catch (error) {
    res.status(500).json({ status:500, message: "Internal Server Error", error: error.message });
  }
};

//resetPassword
exports.resetPassword = async (req, res) => {
  const { email, newPassword } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ status: 400, message: "User not found" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetPasswordOTP = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res
      .status(200)
      .json({ status: 200, message: "Password reset successfully",data:user });
  } catch (error) {
    console.log(error)
    res.status(500).json({ status: 500, message: "Internal Server Error", data:error });
  }
};

//upload images
exports.uploadSingleImage = async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const folderName = "single";
    const result = await uploadSingleImageToCloudflare(file, folderName);
    // console.log(result.imageUrl);
    res
      .status(200)
      .json({ status: 200, message: "Upload Sucessfully", data: result });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// uploadMultipleImages

exports.uploadMultipleImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "No files uploaded" });
    }

    const files = req.files;
    const folderName = "multiple";
    const result = await uploadMultipleImagesToCloudflare(files, folderName);
    res
      .status(200)
      .json({ status: 200, message: "Upload Sucessfully", data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all freelancers for the client-side dashboard
exports.getAllFreelancers = async (req, res) => {
  try {
    // Find all freelancers (isClient: false)
    const freelancers = await User.find({ isClient: false }).select("username email ");

    if (!freelancers.length) {
      return res.status(404).json({
        status: 404,
        message: "No freelancers found.",
      });
    }

    // Extract freelancer IDs to fetch their user details
    const freelancerIds = freelancers.map((freelancer) => freelancer._id);

    // Fetch user details for freelancers who have them
    const freelancerDetailsWithInfo = await UserDetails.find({ user: { $in: freelancerIds } })
      .populate("user","email userName isClient") // Populating user details in the response

    // Extract IDs of freelancers who have details
    const freelancersWithDetailsIds = freelancerDetailsWithInfo.map((detail) => detail.user._id.toString());

    // Find freelancers who don't have UserDetails by excluding those IDs
    const freelancersWithoutDetails = freelancers.filter(
      (freelancer) => !freelancersWithDetailsIds.includes(freelancer._id.toString())
    );

    res.status(200).json({
      status: 200,
      message: "Freelancers retrieved successfully",
      data: {
        freelancersWithDetails: freelancerDetailsWithInfo,
        freelancersWithoutDetails,
      },
    });
  } catch (err) {
    console.error("Error fetching freelancers:", err);
    res.status(500).json({
      status: 500,
      message: "Internal server error",
      error: err.message,
    });
  }
};

// Get client analytics
exports.getClientAnalytics = async (req, res) => {
  try {
    const clientId = req.user.id;

    // Fetching all projects for the client
    const projects = await Project.find({ clientId })
      .populate("clientId", "userName email")
      .lean(); // Convert to plain JavaScript objects for easier manipulation

    const freelancersHired = await Payment.find({
      freelancerId: { $exists: true },
      proposalId: { $exists: true },
    })
      .populate({
        path: "freelancerId",
        select: "userName email",
        populate: { path: "userDetails", model: UserDetails },
      })
      .populate({
        path: "proposalId",
        select: "projectId",
        populate: { path: "projectId", model: Project },
      });

    const freelancersHiredCount = freelancersHired.length;

    const projectsPosted = projects.length;

    res.status(200).json({
      projectsPosted,
      projects,
      freelancersHiredCount,
      freelancersHired,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Get user analytics
exports.getUserAnalytics = async (req, res) => {
  try {
    const userId = req.user.id;

    // Number of proposals submitted
    const proposalsSubmitted = await Proposal.countDocuments({
      userId: userId,
    });

    // Number of closed proposals and their types
    const closedProposals = await Proposal.aggregate([
      { $match: { userId: userId, status: "Accepted" } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    res.status(200).json({
      proposalsSubmitted,
      closedProposals,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.updateClient = async (req, res) => {
  try {
    const userId = req.user.id; // The logged-in user's ID
    const { userName } = req.body; // New username from the request body
    const isClient = true; // Ensure the user is a client
    const file = req.file; // Profile image uploaded from the request

    // Find the user by ID and ensure they are a client
    const user = await User.findOne({ _id: userId, isClient });
    if (!user) {
      return res.status(404).json({
        status: 404,
        message: "Client not found or user is not a client.",
      });
    }

    // Check if the new userName is already taken by another user
    if (userName) {
      const existingUser = await User.findOne({
        userName: userName.trim(),
        _id: { $ne: userId },
      });
      // if (existingUser) {
      //   return res.status(409).json({
      //     status: 409,
      //     message: "Username is already taken by another user.",
      //   });
      // }
      user.userName = userName.trim();
    }

    // Upload image if present, else assign an empty string
    let profileImgUrl = "";
    if (file) {
      profileImgUrl = await uploadSingleImageToCloudflare(file);
    }

    // Update the user's profileImg if an image is provided
    user.profileImg = profileImgUrl || "";

    // Save the updated user
    await user.save();

    res.status(200).json({
      status: 200,
      message: "Client updated successfully.",
      data: {
        userName: user.userName,
        profileImg: user.profileImg || "",
      },
    });
  } catch (err) {
    console.error("Error updating client:", err);
    res.status(500).json({
      status: 500,
      message: "Failed to update client.",
      error: err.message,
    });
  }
};


exports.getClient = async (req,res)=>{
  try {
    const userId = req.user.id;
    const isClient = true;
    const user = await User.findOne({ _id: userId, isClient });
    if (!user) {
      return res.status(404).json({
        status: 404,
        message: "Client not found or user is not a client.",
      });
    }
    res.status(200).json({
      status: 200,
      message: "Client retrieved successfully.",
      data: user, 
    });
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: "Failed to Get client.",
      error: err.message,
    });
  }
}

exports.updatefreelance = async (req, res) => {
  try {
    const userId = req.user.id; 
    const { userName } = req.body; 
    const isClient = false; 
    const file = req.file; 

    const user = await User.findOne({ _id: userId, isClient });
    if (!user) {
      return res.status(404).json({
        status: 404,
        message: "Client not found or user is not a client.",
      });
    }

    // Check if the new userName is already taken by another user
    if (userName) {
      const existingUser = await User.findOne({
        userName: userName.trim(),
        _id: { $ne: userId },
      });
      // if (existingUser) {
      //   return res.status(409).json({
      //     status: 409,
      //     message: "Username is already taken by another user.",
      //   });
      // }
      user.userName = userName.trim();
    }

    // Upload image if present, else assign an empty string
    let profileImgUrl = "";
    if (file) {
      profileImgUrl = await uploadSingleImageToCloudflare(file);
    }

    // Update the user's profileImg if an image is provided
    user.profileImg = profileImgUrl || "";

    // Save the updated user
    await user.save();

    res.status(200).json({
      status: 200,
      message: "freelance updated successfully.",
      data: {
        userName: user.userName,
        profileImg: user.profileImg || "",
      },
    });
  } catch (err) {
    console.error("Error updating client:", err);
    res.status(500).json({
      status: 500,
      message: "Failed to update client.",
      error: err.message,
    });
  }
};
