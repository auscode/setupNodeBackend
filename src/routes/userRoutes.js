const express = require("express");
const router = express.Router();
const userController = require("../controller/userController");
const authMiddleware = require("../middlewares/authMiddleware"); // Auth middleware to get userId
const upload = require("../middlewares/multerMiddleware");

// POST /user/onboard - Create a new user details entry
router.post("/onboard", authMiddleware, upload.single("profileImage"), userController.createUserDetails);

// GET /user/details - Retrieve user details by userId
router.get("/details", authMiddleware, userController.getUserDetails);

// PUT /user/details - Update user details by userId
router.put("/details", authMiddleware, upload.single("profileImage"), userController.updateUserDetails);

// DELETE /user/details - Delete user details by userId
router.delete("/details", authMiddleware, userController.deleteUserDetails);

router.get("/allUsers", authMiddleware, userController.allUsers);

router.get("/allProjects", authMiddleware, userController.allprojects);

router.get("/allProposals", authMiddleware, userController.allproposals);

module.exports = router;
