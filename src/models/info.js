const mongoose = require("mongoose");

const termsAndConditionsSchema = new mongoose.Schema(
  {
    privacyPolicy: {
      type: String,
    },
    termsAndConditions: {
      type: String,
    },
    about: {
      type: String,
    },
    updatedAtPrivacyPolicy: {
      type: Date,
      default: Date.now(),
    },
    updatedAtTermsAndConditions: {
      type: Date,
      default: Date.now(),
    },
    updatedAtAbout: {
      type: Date,
      default: Date.now(),
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("TermsAndConditions", termsAndConditionsSchema);
