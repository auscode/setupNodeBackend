const express = require("express");
const router = express.Router();
const projectController = require("../controller/projectController");
const clientAuthMiddleware = require("../middlewares/clientAuthMiddleware");
const authMiddleware = require("../middlewares/authMiddleware");

router.get("/clientWise", clientAuthMiddleware, projectController.getProjectByClient)
// Filter Projects
router.get("/filter", projectController.filterProjects);

// Create Project
router.post("/", clientAuthMiddleware, projectController.createProject);

// Retrieve Project Details
router.get(
  "/:projectId",
  clientAuthMiddleware,
  projectController.getProjectById
);

// Update Project
router.put(
  "/:projectId",
  clientAuthMiddleware,
  projectController.updateProject
);

// Delete Project
router.delete(
  "/:projectId",
  clientAuthMiddleware,
  projectController.deleteProject
);

// List All Projects
router.get("/", projectController.getAllProjects);


module.exports = router;
