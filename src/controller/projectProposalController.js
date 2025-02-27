const Proposal = require("../models/proposal");
const User = require("../models/user");
const Project = require("../models/project");
const UserDetails = require("../models/userDetails");
const { uploadMultipleImagesToCloudflare } = require("../utils/commonFunction");
const mongoose = require("mongoose");

const createProposal = async (req, res) => {
  try {
    const {
      projectId,
      proposalTitle,
      proposalDescription,
      estimatedTime,
      proposedBudget,
      address,
    } = req.body;

    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(400).json({
        status:400,
        message: "User does not exist",
      });
    }

    let proposalImageUrl = null;
    if (req.files && req.files.length > 0) {
      try {
        const folderName = "proposals";
        proposalImageUrl = await uploadMultipleImagesToCloudflare(req.files,folderName);
      } catch (error) {
        return res.status(500).json({
          status: 500,
          message: "Error uploading image to Cloudflare",
          error: error.message,
        });
      }
    }

    const newProposal = new Proposal({
      projectId,
      userId,
      proposalTitle,
      proposalDescription,
      estimatedTime,
      proposedBudget,
      status: "Submitted",
      proposalImage: proposalImageUrl,
      address,
    });

    await newProposal.save();
    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({
        status: "error",
        message: "Project not found",
      });
    }

    // Push the proposalId to the project's proposalId array
    project.proposalId = newProposal._id;
    await project.save();
    res.status(201).json({
      status: 201,
      message: "Proposal created successfully",
      data: { proposalId: newProposal, user },
    });
  } catch (err) {
    console.error("Error creating proposal:", err);
    res.status(500).json({
      status: 500,
      message: "Internal server Error",
      error: err.message,
    });
  }
};

//Retrive Proposals clients can retrive
const getProposalsForProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const clientId = req.user;

    const proposals = await Proposal.find({ projectId });

    res.status(200).json({
      status:200,
      message: "success",
      data: proposals,
    });
  } catch (err) {
    console.error("Error retrieving proposals:", err);

    res.status(500).json({
      status: 500,
      message: "Internal server Error",
      error: error.message,
    });
  }
};

//update proposal freelancer can update
const updateProposal = async (req, res) => {
  try {
    const { proposalId } = req.params;
    const {
      proposalTitle,
      proposalDescription,
      estimatedTime,
      proposedBudget,
      address,
      status
    } = req.body;

    const userId = req.user.id; // Assuming req.user contains the user ID
    const user = await User.findById(userId);

    if (!user) {
      return res.status(400).json({
        status: 400,
        message: "User does not exist",
      });
    }

    const proposals = await Proposal.findById(proposalId);
    if (!proposalId) {
      return res.status(404).json({
        status: 404,
        message: "Proposal not found",
      });
    }
    let proposalImageUrl = null;
    if (req.files && req.files.length > 0) {
      try {
        const folderName = "proposals";
        proposalImageUrl = await uploadMultipleImagesToCloudflare(req.files,folderName);
      } catch (error) {
        return res.status(500).json({
          status: 500,
          message: "Error uploading image to Cloudflare",
          error: error.message,
        });
      }
    }
    if(proposalImageUrl){
      proposals.proposalImage=proposalImageUrl;
    }


    proposals.proposalTitle = proposalTitle;
    proposals.proposalDescription = proposalDescription;
    proposals.estimatedTime = estimatedTime;
    proposals.proposedBudget = proposedBudget;
    proposals.address = address;
    proposals.status = status;

    await proposals.save();

    res.status(200).json({
      status: 200,
      message: "Proposal updated successfully",
      data:{proposals,user}
    });
  } catch (err) {
    console.error("Error updating proposal:", err);
    res.status(500).json({
      status: 500,
      message: "Internal server Error",
      error: err.message,
    });
  }
};

//delete proposal freelancer can delete
const deleteProposal = async (req, res) => {
  try {
    const { proposalId } = req.params;

    const userId = req.user.id; // Assuming req.user contains the user ID
    const user = await User.findById(userId);

    if (!user) {
      return res.status(400).json({
        status: 400,
        message: "User does Not exist",
      });
    }

    const proposal = await Proposal.findByIdAndDelete(proposalId);

    if (!proposal) {
      return res.status(404).json({
        status: 404,
        message: "Proposal not found",
      });
    }
    res.status(200).json({
      status: 200,
      message: "Proposal deleted successfully",
    });
  } catch (err) {
    console.error("Error deleting proposal:", err);
    res.status(500).json({
      status: 500,
      message: "Internal server Error",
      error: err.message,
    });
  }
};

//Review Proposal
const reviewProposal = async (req, res) => {
  try {
    const { proposalId } = req.params;
    const { status } = req.body;

    const clientId = req.user.id;

    if (!status) {
      return res.status(404).json({
        status: 404,
        message: "status needs to be updated",
      });
    }

    const proposal = await Proposal.findById(proposalId);
    if (!proposal) {
      return res.status(404).json({
        status: 404,
        message: "Proposal not found",
      });
    }
    proposal.status = status;

    await proposal.save();

    res.status(200).json({
      status: 200,
      message: "Proposal reviewed successfully",
      data:proposal
    });
  } catch (error) {
    console.error("Error reviewing proposal:", err);
    res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
};

const getAllProposals = async (req, res) => {
  try {
    const { projectId } = req.params;

    // Validate projectId
    if (!projectId) {
      return res.status(400).json({
        status: 400,
        message: "ProjectId is required",
      });
    }

    // Retrieve page and limit from query parameters, with default values
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    // Calculate the starting index for pagination
    const startIndex = (page - 1) * limit;

    // Find proposals for the given project ID with pagination
    const proposals = await Proposal.find({ projectId })
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limit)
      .populate({
        path: "userId",
        select: "userName email profileImg phoneNumber",
        model: "User",
      })
      .then(async (proposalsWithUsers) => {
        // Populate the UserDetails for each populated User in proposals
        return Promise.all(
          proposalsWithUsers.map(async (proposal) => {
            if (proposal.userId) {
              const userDetails = await UserDetails.findOne({
                user: proposal.userId._id,
              })
              proposal = proposal.toObject(); // Convert to plain object to add userDetails directly
              proposal.userDetails = userDetails;
            }
            return proposal;
          })
        );
      });

    // Get the total number of proposals for the project
    const totalProposals = await Proposal.countDocuments({ projectId });

    res.status(200).json({
      status: 200,
      message: "success",
      data: {
        proposals,
        currentPage: page,
        totalPages: Math.ceil(totalProposals / limit),
        totalProposals,
      },
    });
  } catch (err) {
    console.error("Error retrieving proposals:", err);
    res.status(500).json({
      status: 500,
      message: "Internal server Error",
      error: err.message,
    });
  }
};


const getProposalsByStatus = async (req, res) => {
  try {
    const { status } = req.query;
    const data = await Proposal.find({ status: status });
    return res
      .status(200)
      .json({
        status: 200,
        message: "Record fetched successfully",
        data:{ data,
        totalRecords: data.length,
        }
      });
  } catch (error) {
    console.error("Error retrieving proposals:", err);
    res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
};

// Get all proposals sent by the logged-in user (freelancer)
const getProposalsSentByUser = async (req, res) => {
  try {
    const userId = req.user.id;

    const proposals = await Proposal.find({ userId })
      .populate({
        path: "projectId",
        select: "title description clientId", 
        populate: {
          path: "clientId", 
          model: "User",
          select: "userName email profileImg",
        },
      })
      .sort({ createdAt: -1 });

    if (!proposals.length) {
      return res.status(404).json({
        status: 404,
        message: "No proposals found for this user.",
      });
    }

    const populatedProposals = await Promise.all(
      proposals.map(async (proposal) => {
        // Fetch UserDetails for the user (freelancer) who sent the proposal
        let freelancerDetails = null;
        if (proposal.userId) {
          freelancerDetails = await UserDetails.findOne({
            user: new mongoose.Types.ObjectId(proposal.userId), // Ensure using ObjectId
          }).select("user profileImage firstName lastName");

          if (!freelancerDetails) {
            console.error(
              `No UserDetails found for freelancer (userId: ${proposal.userId})`
            );
          }
        } else {
          console.error("No userId found in the proposal.");
        }

        // Fetch UserDetails for the client (clientId in the project)
        let clientDetails = null;
        if (proposal.projectId && proposal.projectId.clientId) {
          const clientId = proposal.projectId.clientId._id || proposal.projectId.clientId; // Check if populated

          clientDetails = await UserDetails.findOne({
            user: new mongoose.Types.ObjectId(clientId), // Ensure using ObjectId
          }).select("user profileImage firstName lastName");

          if (!clientDetails) {
            console.error(
              `No UserDetails found for client (clientId: ${clientId})`
            );
          }
        } else {
          console.error("No clientId found in the project.");
        }

        return {
          ...proposal._doc, // Spread the original proposal object
          freelancerDetails, // Add the freelancer details (userId)
          clientDetails, // Add the client details (clientId)
        };
      })
    );

    res.status(200).json({
      status: 200,
      message: "Proposals retrieved successfully",
      data: populatedProposals,
    });
  } catch (err) {
    console.error("Error retrieving user proposals:", err);
    res.status(500).json({
      status: 500,
      message: "Internal server error",
      error: err.message,
    });
  }
};


const getProposalsReceivedByProvider = async (req, res) => {
  try {
    const providerId = req.user.id;

    // Find all projects where providerId matches the logged-in provider
    const providerProjects = await Project.find({ providerId }).select('_id');

    // Extract project IDs into an array
    const projectIds = providerProjects.map(project => project._id);

    // Find proposals for these project IDs, sorted by createdAt
    const proposals = await Proposal.find({ projectId: { $in: projectIds } })
      .populate({
        path: "projectId",
        select: "title description",
      })
      .populate({
        path: "userId",
        select: "userName email profileImg",
      })
      .sort({ createdAt: -1 });

      const populatedProposals = await Promise.all(
        proposals.map(async (proposal) => {
          // Manually query `UserDetails` by `userId`
          const userDetails = await UserDetails.findOne({
            user: proposal.userId,
          }).select("profileImage firstName lastName");

          // Add `profileImage` to the proposal object if `UserDetails` is found
          if (userDetails) {
            return {
              ...proposal.toObject(),
              userDetails: {
                profileImage: userDetails.profileImage,
                firstName: userDetails.firstName,
                lastName: userDetails.lastName,
              },
            };
          } else {
            return proposal;
          }
        })
      );

    if (!populatedProposals.length) {
      return res.status(404).json({
        status: 404,
        message: "No proposals found for this provider.",
      });
    }

    res.status(200).json({
      status: 200,
      message: "Proposals retrieved successfully",
      data: populatedProposals,
    });
  } catch (err) {
    console.error("Error retrieving provider proposals:", err);
    res.status(500).json({
      status: 500,
      message: "Internal server error",
      error: err.message,
    });
  }
};

const createProposaltoFreelancer = async (req, res) => {
  try {
    const {
      userId,
      proposalTitle,
      proposalDescription,
      estimatedTime,
      proposedBudget,
      address,
    } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(400).json({
        status: 400,
        message: "User does not exist",
      });
    }

    let proposalImageUrl = null;
    if (req.files && req.files.length > 0) {
      try {
        const folderName = "proposals";
        proposalImageUrl = await uploadMultipleImagesToCloudflare(
          req.files,
          folderName
        );
      } catch (error) {
        return res.status(500).json({
          status: 500,
          message: "Error uploading image to Cloudflare",
          error: error.message,
        });
      }
    }

    const newProposal = new Proposal({
      userId,
      proposalTitle,
      proposalDescription,
      estimatedTime,
      proposedBudget,
      status: "Submitted",
      proposalImage: proposalImageUrl,
      address,
    });

    await newProposal.save();
    res.status(201).json({
      status: 201,
      message: "Proposal created successfully",
      data: { proposalId: newProposal, user },
    });
  } catch (err) {
    console.error("Error creating proposal:", err);
    res.status(500).json({
      status: 500,
      message: "Internal server error",
      error: err.message,
    });
  }
};


module.exports = {
  createProposal,
  getProposalsForProject,
  reviewProposal,
  deleteProposal,
  updateProposal,
  getAllProposals,
  getProposalsByStatus,
  getProposalsSentByUser,
  getProposalsReceivedByProvider,
  createProposaltoFreelancer,
};
