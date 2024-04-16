const jwt = require("jsonwebtoken");

const tokenForEmailVerification = (email) => {
  return `${process.env.FRONTEND_URL}/verify?token=${jwt.sign(
    { email: email },
    process.env.JWT_SECRET_KEY
  )}`;
};

module.exports = tokenForEmailVerification;
