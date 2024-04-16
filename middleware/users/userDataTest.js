const { USER_ROLES } = require("../../constants.js");

const correctName = (req, res, next) => {
  const { name } = req.body;
  if (name.length < 3 || name.length > 40 || !name.match(/^[A-Za-z\s]+$/)) {
    return res.status(400).json({
      response:
        "Name must have the length between 3 - 40 and must only contain alphabets",
    });
  }
  next();
};

const correctEmail = (req, res, next) => {
  const { email } = req.body;
  if (
    email.length < 1 ||
    !email.match(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)
  )
    return res.status(400).json({ response: "Email Format is incorrect" });

  next();
};

const correctPassword = (req, res, next) => {
  const { password } = req.body;
  if (
    password.length < 3 ||
    password.length > 10 ||
    !password.match(
      /^(?=.*[A-Za-z])(?=.*[0-9])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).*$/
    )
  )
    return res.status(400).json({
      response:
        "Password should be strong with Numbers, Alphabets and some Special characters with maximum length of 10",
    });

  next();
};

const correctRole = (req, res, next) => {
  const { role } = req.body;
  if (role && !USER_ROLES.includes(role))
    return res.status(400).json({
      response: "User Role can only be 'Student', 'Teacher' or 'Admin'",
    });

  next();
};

module.exports = { correctName, correctEmail, correctPassword, correctRole };
