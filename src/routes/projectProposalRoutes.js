const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const clientAuthMiddleware = require("../middlewares/clientAuthMiddleware");

const {
  createProposal,
  getProposalsForProject,
  updateProposal,
  deleteProposal,
  reviewProposal,
  getAllProposals,
  getProposalsByStatus,
  getProposalsSentByUser,
  getProposalsReceivedByProvider,
  createProposaltoFreelancer,
} = require("../controller/projectProposalController");

const upload = require("../middlewares/multerMiddleware")

// Route to create a proposal (only accessible to authenticated freelancers)
router.post("/proposal", authMiddleware,upload.array("proposalImage"), createProposal);
router.post("/proposal/freelance", authMiddleware,upload.array("proposalImage"), createProposaltoFreelancer);

// Route to get all proposals for a specific project (only accessible to authenticated clients)
router.get(
  "/projects/:projectId",
  clientAuthMiddleware,
  getProposalsForProject
);

// Route to update a specific proposal (only accessible to authenticated freelancers)
router.put("/updateProposal/:proposalId", authMiddleware,upload.array("proposalImage"), updateProposal);

// Route to delete a specific proposal (only accessible to authenticated freelancers)
router.delete("/deleteProposal/:proposalId", authMiddleware, deleteProposal);

// Route for a client to review a specific proposal (only accessible to authenticated clients)
router.put(
  "/reviewProposal/:proposalId/review",
  clientAuthMiddleware,
  reviewProposal
);

// Route to get all proposals for a specific project (only accessible to authenticated clients)
router.get(
  "/project/:projectId/proposal",
  clientAuthMiddleware,
  getAllProposals
);

router.get(
  "/project/proposal",
  clientAuthMiddleware,
  getProposalsByStatus
);

// Route to get all proposals sent by the authenticated freelancer
router.get("/proposals/sent", authMiddleware, getProposalsSentByUser);

// Route to get all proposals received by the authenticated provider
router.get("/proposals/received", clientAuthMiddleware, getProposalsReceivedByProvider);


module.exports = router;
