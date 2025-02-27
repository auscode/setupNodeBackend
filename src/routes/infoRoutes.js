const express = require("express");
const router = express.Router();
const {
  createOrUpdateInfo,
  getPrivacyPolicy,
  getTermsAndConditions,
  getAbout,
} = require("../controller/infoController"); 
// const adminMiddleware = require("../middlewares/adminMiddleware");

router.post("/", createOrUpdateInfo);

router.get("/privacyPolicy", getPrivacyPolicy);

router.get("/termsAndConditions", getTermsAndConditions);

router.get("/about", getAbout);

module.exports = router;
