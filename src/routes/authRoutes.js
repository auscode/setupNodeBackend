
const express = require('express');
const multer = require('multer');
const router = express.Router();
const authController = require('../controller/authController');
const authMiddleware = require('../middlewares/authMiddleware');
const  uploadImage  = require('../utils/commonFunction');

  const upload = multer();


router.post('/register', authController.registerUser);
router.post("/register/client", upload.single('profileImg'), authController.registerProvider);
router.post('/login', authController.loginUser);
router.post('/change-password', authMiddleware, authController.changePassword);
router.post('/forgot-password/send-otp', authController.sendResetPasswordOTP);
router.post('/forgot-password/verify-otp', authController.verifyResetPasswordOTP);
router.post('/forgot-password/reset-password', authController.resetPassword);


router.get('/getAllFreelancers', authMiddleware, authController.getAllFreelancers);
router.get("/client-analytics", authMiddleware, authController.getClientAnalytics);
router.get("/getUserAnalytics",authMiddleware, authController.getUserAnalytics);
//single images
router.post('/upload', upload.single('file'), authController.uploadSingleImage);
//multi images

router.post('/multiupload', upload.array('files'), authController.uploadMultipleImages);
router.put("/edit-profile", upload.single('profileImg'),authMiddleware, authController.updateClient);
router.put("/edit-profile-freelance", upload.single('profileImg'),authMiddleware, authController.updatefreelance);
router.get("/client",
  authMiddleware,
  authController.getClient
);


module.exports = router;

