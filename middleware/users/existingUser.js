const User = require("../../database/schemas/UserSchema");

const existingUser = async (req, res, next) => {
  try {
    const existingUser = await User.findOne({ email: req.body.email });
    req.existingUser = existingUser;
    next();
  } catch (e) {
    return res
      .status(400)
      .json({
        response: `Unexpected Error '${e.message}' occurred while fetching your data`,
      });
  }
};

module.exports = existingUser;
