const nodemailer = require('nodemailer');
require('dotenv').config(); 

const transporter = nodemailer.createTransport({
  host: "smtp.hostinger.com", // Hostinger ke SMTP server ka hostname
  port: 465, // Port 587 ka istemal karein, aur SSL ka istemal na karein
  secure: true,
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASS,
  },
});

const sendEmail = async (subject, recipientEmail, body) => {
  try {
    const mailOptions = {
      from: process.env.DEFAULT_MAIL,
      to: recipientEmail,
      subject: subject,
      html: body,
    };
     
    const info = await transporter.sendMail(mailOptions);
   
  } catch (error) {
   
    throw error;
  }
};

module.exports = { sendEmail };
