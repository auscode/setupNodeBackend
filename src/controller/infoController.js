const TermsAndConditions = require("../models/info");

exports.createOrUpdateInfo = async (req, res) => {
  const { privacyPolicy, termsAndConditions, about } = req.body;

  try {
    let info = await TermsAndConditions.findOne();

    if (!info) {
      info = new TermsAndConditions({
        privacyPolicy,
        termsAndConditions,
        about,
      });
    } else {
      if (privacyPolicy) {
        info.privacyPolicy = privacyPolicy;
        info.updatedAtPrivacyPolicy = Date.now();
      }
      if (termsAndConditions) {
        info.termsAndConditions = termsAndConditions;
        info.updatedAtTermsAndConditions = Date.now();
      }
      if (about) {
        info.about = about;
        info.updatedAtAbout = Date.now();
      }
    }

    const savedInfo = await info.save();

    res.status(201).json({
      status: 201,
      message:
        "Privacy Policy, Terms and Conditions, and About section saved successfully!",
      data: savedInfo,
    });
  } catch (error) {
    res.status(500).json({ status: 500, message: error.message });
  }
};

exports.getPrivacyPolicy = async (req, res) => {
  try {
    const privacyPolicy = await TermsAndConditions.findOne().select(
      "privacyPolicy createdAt updatedAt updatedAtPrivacyPolicy"
    );

    if (!privacyPolicy || !privacyPolicy.privacyPolicy) {
      return res.status(404).json({
        status: 404,
        message: "Privacy Policy not found.",
      });
    }

    res.status(200).json({
      status: 200,
      message: "Fetched Privacy Policy",
      data: {
        privacyPolicy: privacyPolicy.privacyPolicy,
        createdAt: privacyPolicy.createdAt,
        updatedAt: privacyPolicy.updatedAt,
        updatedAtPrivacyPolicy: privacyPolicy.updatedAtPrivacyPolicy,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

exports.getTermsAndConditions = async (req, res) => {
  try {
    const terms = await TermsAndConditions.findOne().select(
      "termsAndConditions createdAt updatedAt updatedAtTermsAndConditions"
    );
    if (!terms || !terms.termsAndConditions) {
      return res.status(404).json({
        status: 404,
        message: "Terms and Conditions not found.",
      });
    }

    res.status(200).json({
      status: 200,
      message: "Fetched Terms and Conditions",
      data: {
        termsAndConditions: terms.termsAndConditions,
        createdAt: terms.createdAt,
        updatedAt: terms.updatedAt,
        updatedAtTermsAndConditions: terms.updatedAtTermsAndConditions,
      },
    });
  } catch (error) {
    res.status(500).json({ status: 500, message: error.message });
  }
};

exports.getAbout = async (req, res) => {
  try {
    const terms = await TermsAndConditions.findOne().select(
      "about createdAt updatedAt updatedAtAbout"
    );
    if (!terms || !terms.about) {
      return res.status(404).json({
        status: 404,
        message: "About section not found.",
      });
    }

    res.status(200).json({
      status: 200,
      message: "Fetched About section",
      data: {
        about: terms.about,
        createdAt: terms.createdAt,
        updatedAt: terms.updatedAt,
        updatedAtAbout: terms.updatedAtAbout,
      },
    });
  } catch (error) {
    res.status(500).json({ status: 500, message: error.message });
  }
};
