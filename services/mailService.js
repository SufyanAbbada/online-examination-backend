const nodemailer = require("nodemailer");
const dotenv = require("dotenv");

dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GOOGLE_OAUTH_USER,
    pass: process.env.GOOGLE_OAUTH_PASSWORD,
  },
});

const mail = async (receiver, generatedToken) => {
  const emailStatus = await transporter.sendMail({
    from: process.env.GOOGLE_OAUTH_USER,
    to: receiver,
    subject: "Email Verification for Online Examination",
    html: `<div><h1>Welcome to Online Examination</h1><p>This is the first step towards your entry ticket into Online Examination. You just signed up to our system, and we want you to be verified.</p><br /><p>Please click this <b><a href='${generatedToken}'>Link</a></b> to get you verified</p><br /><p>This link will expire in half an hour. You can disregard this email if you are not aware of this action.</p><br /><p>Thanks for choosing Online Examination</p></div>`,
  });

  return emailStatus;
};

module.exports = mail;
