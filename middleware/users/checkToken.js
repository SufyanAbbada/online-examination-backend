const User = require("../../database/schemas/UserSchema");
const jwt = require("jsonwebtoken");

const checkTokenAvailability = (req, res, next) => {
  const { token } = req.headers;
  if (!token)
    return res.status(412).json({
      response: "No Token found in the Request. You are not logged In",
    });
  else {
    req.token = token;
    return next();
  }
};

// This middleware can only pass if the `checkTokenAvailability` is run before it
const checkAdminRole = async (req, res, next) => {
  const { token } = req.headers;
  try {
    const testUser = await User.findOne({
      email: jwt.verify(token, process.env.JWT_SECRET_KEY).email,
    });
    if (testUser.role === "admin") {
      next();
    } else {
      return res.status(412).json({
        response: "You are not authorized to perform this action",
      });
    }
  } catch (error) {
    return res.status(417).json({
      response: "Token Verification failed",
    });
  }
};

module.exports = { checkTokenAvailability, checkAdminRole };
