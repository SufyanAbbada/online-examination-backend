const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("../database/schemas/UserSchema");
const {
  correctName,
  correctEmail,
  correctPassword,
} = require("../middleware/users/userDataTest");
const existingUser = require("../middleware/users/existingUser");

const saltRounds = 10;

router.post(
  "/register",
  correctName,
  correctEmail,
  correctPassword,
  existingUser,
  async (req, res) => {
    const { name, email, password } = req.body;

    if (!req.existingUser) {
      bcrypt
        .hash(password, saltRounds)
        .then((hash) => {
          return User.create({ name, email, password: hash });
        })
        .then((newUser) => {
          return res.status(200).json({ response: newUser });
        });
    } else {
      return res
        .status(409)
        .json({ response: "User with this Email already exists" });
    }
  }
);

router.post("/login", correctEmail, correctPassword, async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email: email });

    if (!user)
      return res
        .status(404)
        .json({ response: "No User with this Email found in the System" });

    const passwordCheck = await bcrypt.compare(password, user.password);

    if (!passwordCheck)
      return res.status(404).json({ response: "Incorrect Email or Password" });

    if (user && passwordCheck) {
      return res.status(200).json({
        response: jwt.sign({ email: user.email }, process.env.JWT_SECRET_KEY),
      });
    }
  } catch (error) {
    return res.status(401).json({
      response: `Error '${error.message}' while entertaining your request`,
    });
  }
});

router.post("/decrypt", async (req, res) => {
  const { token } = req.body;

  try {
    const user = jwt.verify(token, process.env.JWT_SECRET_KEY);

    const userPresent = await User.findOne({
      email: jwt.verify(token, process.env.JWT_SECRET_KEY).email,
    });

    if (userPresent) {
      const { name, email } = userPresent;
      return res.status(200).json({ response: { name, email } });
    } else {
      return res.status(400).json({
        response: "Error while entertaining your request",
      });
    }
  } catch (e) {
    console.log(e.message);
  }
});

module.exports = router;
