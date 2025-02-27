
const express = require('express');
const router = express.Router();
const paymentController = require('../controller/paymentController');
const authMiddleware = require('../middlewares/authMiddleware');



router.post('/projects/:projectId/proposals/:proposalId/accept', paymentController.requestPayment);




router.get('/proposals/:proposalId/payment-request', paymentController.retrievePaymentRequests);


module.exports = router;

