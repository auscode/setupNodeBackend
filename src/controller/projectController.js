const Project = require("../models/project");
const User = require("../models/user");
const UserDetails = require("../models/userDetails");
const upload = require("../middlewares/multerMiddleware");
const { uploadSingleImageToCloudflare } = require("../utils/commonFunction");

// Create Project
exports.createProject = async (req, res) => {
  upload.single("Attachment")(req, res, async (err) => {
    if (err) {
      return res
        .status(400)
        .json({ message: "File upload error", error: err.message });
    }
    try {
      const {
        title,
        description,
        category,
        subCategory,
        budget,
        skillsRequired,
        deadline,
        experienceLevel,
        TimelineType,
        projectTime,
        status,
        address,
      } = req.body;
      
      const project = new Project({
        clientId: req.user,
        title,
        description,
        category,
        subCategory,
        budget,
        skillsRequired,
        deadline,
        experienceLevel,
        TimelineType,
        projectTime,
        status,
        address,
      });

      if(req.file){
        const folderName='single';
        const result = await uploadSingleImageToCloudflare(req.file,folderName);
        project.Attachment = result;
      }  

      await project.save();
      res.status(201).json({
        status:201,
        message: "Project created successfully",
        data:{ project }
      });
    } catch (error) {
      res.status(500).json({
        status: 500,
        message: "Internal server Error",
        error: error.message,
      });
    }
  });
};

// Retrieve Project Details
exports.getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId)
      .populate("clientId", "userName email")
      .populate({
        path: "proposalId",
        populate: {
          path: "userId", // Populate the userId within proposalId
          select: "userName email profileImg profileImage phoneNumber", // Select fields to return
        },
      });
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    // Step 2: Extract clientId from the project (this is the userId in both User and UserDetails)
    const clientId = project.clientId._id.toString();
    console.log(clientId.toString());
    console.log(clientId);

    // Step 3: Fetch User details from the User model
    const user = await User.findById(clientId)
    console.log(user);
    
    // Step 4: Fetch additional user details from the UserDetails model
    const userDetails = await UserDetails.findOne({ user: clientId })
    console.log(userDetails);

    if (!user || !userDetails) {
      return res.status(404).json({ message: "User or UserDetails not found" });
    }

    // Step 5: Combine user and userDetails data
    const clientData = {
      _id: user._id,
      userName: user.userName,
      email: user.email,
      profileImg: user.profileImg,
      profileImage: userDetails.profileImage,
      phoneNumber: userDetails.phoneNumber,
      gender: userDetails.gender,
    };

    // Step 6: Send response with the combined data
    res.status(200).json({
      status: 200,
      message: "success",
      data: {
        project,
        client: clientData, // Attach combined client data
      },
    });
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: "Internal server Error",
      error: error.message,
    });
  }
};

// Update Project
exports.updateProject = async (req, res) => {
  upload.single("Attachment")(req, res, async (err) => {
    if (err) {
      return res
        .status(400)
        .json({ message: "File upload error", error: err.message });
    }
    try {
      const updates = req.body;
      const project = await Project.findById(req.params.projectId);

      if (!project) {
        return res.status(404).json({status:404, message: "Project not found" });
      }

      if (project.clientId.toString() !== req.user) {
        return res.status(403).json({status:403, message: "Unauthorized action" });
      }

      // file upadation is handled
      if (req.file) {

        const folderName='single'
        const result = await uploadSingleImageToCloudflare(req.file,folderName);
        updates.Attachment = result;
      }

      Object.keys(updates).forEach((key) => {
        project[key] = updates[key];
      });

      await project.save();
      res
        .status(200)
        .json({  status: 200, message: "Project updated successfully",data:project});
    } catch (error) {
      res.status(500).json({
      status: 500,
      message: "Internal server Error",
      error: error.message,
    });
    }
  });
};

// Delete Project
exports.deleteProject = async (req, res) => {
  try {
    const projectId = req.params.projectId;
    const project = await Project.findById(projectId);
  if (!project) {
    return res.status(404).json({status:404, message: "Project not found" });
  }

  if (project.clientId.toString() !== req.user) {
    return res.status(403).json({status:403, message: "Unauthorized action" });
  }

  await Project.findByIdAndDelete(projectId);
      res
        .status(200)
        .json({status:200, message: "Project deleted successfully"});
    } catch (error) {
      res.status(500).json({
        status: 500,
        message: "Internal server Error",
        error: error.message,
      });
    }
  };

// List All Projects
exports.getAllProjects = async (req, res) => {
  try {
    // Retrieve page and limit from query parameters, with default values
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    // Calculate the starting index for pagination
    const startIndex = (page - 1) * limit;

    // Retrieve the projects with pagination and populate clientId with userName and email
    const projects = await Project.find()
      .sort({ createdAt: -1 })
      .populate("clientId", "userName email")
      .skip(startIndex)
      .limit(limit);
    const populatedProjects = await Promise.all(
      projects.map(async (project) => {
        const clientId = project.clientId._id.toString();

        // Fetch additional details from UserDetails model
        const userDetails = await UserDetails.findOne({
          user: clientId,
        }).select("profileImage phoneNumber");

        const user = await User.findById(clientId).select(
          "profileImg email userName"
        );

        if (userDetails || user) {
          project.clientId = {
            userName: user ? user.userName : undefined,
            email: user ? user.email : undefined,
            profileImg: user ? user.profileImg : undefined,
            profileImage: userDetails ? userDetails.profileImage : undefined,
            phoneNumber: userDetails ? userDetails.phoneNumber : undefined,
            gender: userDetails ? userDetails.gender : undefined,
          };
        }

        return project;
      })
    );
    // Get the total number of projects
    const totalProjects = await Project.countDocuments();

    res.status(200).json({
      status:200,
      message: "success",
      data: {
        projects: populatedProjects,
        currentPage: page,
        totalPages: Math.ceil(totalProjects / limit),
        totalProjects,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: "Internal server Error",
      error: error.message,
    });
  }
};

// Filter Projects
exports.filterProjects = async (req, res) => {
  try {
    const filter = {};
    if (req.query.title) {
      filter.title = { $regex: req.query.title, $options: "i" };
    }
    if (req.query.category) {
      filter.category = { $in: req.query.category.split(",") };
    }

    if (req.query.subCategory) {
      filter.subCategory = { $in: req.query.subCategory.split(",") };
    }

    if (req.query.skillsRequired) {
      filter.skillsRequired = { $in: req.query.skillsRequired.split(",") };
    }

    if (req.query.status) {
      filter.status = req.query.status;
    }

    if (req.query.minBudget && req.query.maxBudget) {
      filter["budget.min"] = { $gte: req.query.minBudget };
      filter["budget.max"] = { $lte: req.query.maxBudget };
    }

    if (req.query.experienceLevel) {
      filter.experienceLevel = req.query.experienceLevel;
    }

    if (req.query.TimelineType) {
      filter.TimelineType = req.query.TimelineType;
    }

    const projects = await Project.find(filter).populate(
      "clientId",
      "userName email"
    );

    if (!projects.length) {
      return res
        .status(404)
        .json({status:404, message: "No projects found"});
    }

    res.status(200).json({ status:200,message: "success", projects });
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: "Internal server Error",
      error: error.message,
    });
  }
};

exports.getProjectByClient = async (req,res) => {
  try {
    const data = await Project.find({clientId: req.user}).populate('clientId');
    return res.status(200).json({status:200,message:"success",data: data});
  } catch (error) {
    return res.status(500).json({
      status: 500,
      message: "Internal server Error",
      error: error.message,
    });
  }
}
