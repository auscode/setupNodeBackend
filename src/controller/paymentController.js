const Payment = require("../models/payment");



const sendEmail = require("../config/email");


// requestPayment
exports.requestPayment = async (req, res) => {
  try {
    const { amount, freelancerId } = req.body;
    const { proposalId } = req.params;

    const paymentRequest = new Payment({
        proposalId,
        freelancerId,
        amount,
      });
      await paymentRequest.save();

    
    res.status(200).json({
        status: "success",
        paymentRequest,
        message: "Payment request created successfully.",
      });
  } catch (err) {
    res.status(500).json({ status: "error",err, message: "An error occurred while creating the payment request. Please try again." });
  }
};

// retrievePaymentRequests
exports.retrievePaymentRequests = async (req, res) => {
  try {

    const { proposalId } = req.params;

    const paymentRequests = await Payment.find({ proposalId });

     // Check if paymentRequests is empty
     if (paymentRequests.length === 0) {
        return res.status(404).json({ status: "success", paymentRequests: [], message: "No payment requests found for this proposal." });
      }
     
    res
      .status(200)
      .json({ status: "success", paymentRequests, message: "Payment requests retrieved successfully." });
  } catch (err) {
    res.status(500).json({ status: "error", message: "Server error" });
  }
};










