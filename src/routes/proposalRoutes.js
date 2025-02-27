const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");

const {
  sendProposal,
  getProposalDetails,
} = require("../controller/proposalController");

router.post("/sendProposal", authMiddleware, sendProposal);
router.post("/getProposalDetails", authMiddleware, getProposalDetails);

module.exports = router;
