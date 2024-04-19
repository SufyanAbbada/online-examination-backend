const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../database/schemas/UserSchema");
const existingUser = require("../middleware/users/existingUser");
const tokenForEmailVerification = require("../helpers/tokenForEmailVerification");
const { addEmailJobInEmailQueue } = require("../services/emailQueue");
const {
  checkTokenAvailability,
  checkAdminRole,
} = require("../middleware/users/checkToken.js");
const {
  correctName,
  correctEmail,
  correctPassword,
  correctRole,
  correctId,
} = require("../middleware/users/userDataTest");

const saltRounds = 10;

router.post(
  "/register",
  correctName,
  correctEmail,
  correctPassword,
  correctRole,
  existingUser,
  async (req, res) => {
    const { name, email, password, role } = req.body;

    try {
      if (!req.existingUser) {
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const newUser = await User.create({
          name,
          email,
          password: hashedPassword,
          role,
          expiresAt: role == "student" ? Date.now() : undefined,
          approved: role === "student",
          verified: role !== "student",
        });

        if (role === "student") {
          await addEmailJobInEmailQueue({
            receiver: newUser.email,
            generatedToken: tokenForEmailVerification(newUser.email),
          });

          return res.status(200).json({
            response: "You will receive a verification Email shortly.",
          });
        } else {
          return res.status(200).json({
            response: "Your request is sent to the Admin for Approval",
          });
        }
      } else {
        return res
          .status(409)
          .json({ response: "User with this Email already exists" });
      }
    } catch (error) {
      return res.status(400).json({ response: error.message });
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

    if (user.expiresAt) {
      return res.status(412).json({
        response: "Verification is pending. Please verify to proceed to Login",
      });
    }

    if (!user.approved) {
      return res.status(412).json({
        response:
          "Approval from System Admin is Pending. Please sit tight as we hope it will be approved soon",
      });
    }

    const passwordCheck = await bcrypt.compare(password, user.password);

    if (!passwordCheck)
      return res.status(404).json({ response: "Incorrect Email or Password" });

    if (user && passwordCheck && !user.expiresAt && user.approved) {
      return res.status(200).json({
        name: user.name,
        email: user.email,
        role: user.role,
        token: jwt.sign({ email: user.email }, process.env.JWT_SECRET_KEY),
      });
    }
  } catch (error) {
    return res.status(401).json({
      response: `Error '${error.message}' while entertaining your request`,
    });
  }
});

router.get("/verify", async (req, res) => {
  const { token } = req.query;
  try {
    const verification = jwt.verify(token, process.env.JWT_SECRET_KEY);

    if (verification.email) {
      const userFound = await User.findOne({ email: verification.email });

      if (userFound && userFound.expiresAt) {
        userFound.expiresAt = undefined;
        userFound.verified = true;
        await userFound.save();

        return res.status(201).json({
          response: "Successfully persisted the user in the Database.",
        });
      } else {
        return res.status(410).json({
          response: "Looks like your token is expired or already been used",
        });
      }
    }
  } catch (error) {
    return res.status(400).json({
      response: `Error occurred while verifying the token "${error.message}"`,
    });
  }

  res.send(token);
});

router.post(
  "/approve",
  checkTokenAvailability,
  checkAdminRole,
  correctId,
  async (req, res) => {
    const { userId, decision = false } = req.body;
    const user = await User.findById(userId);
    if (!decision) {
      await User.deleteOne({ _id: userId });
      return res
        .status(204)
        .json({ response: "User disapproved and removed from the system" });
    } else {
      const user = await User.findById(userId);
      user.approved = true;
      await user.save();
      return res.status(202).json({ response: "User approved" });
    }
  }
);

router.get(
  "/awaiting-approval",
  checkTokenAvailability,
  checkAdminRole,
  async (req, res) => {
    return res.status(200).json({
      response: await User.find({ approved: false }).select(
        "id name email role"
      ),
    });
  }
);

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

router.post("/test", async (req, res) => {
  const { email, password, name, role } = req.body;
  console.log(email);
  console.log(role);

  try {
    const user = await User.create({
      name: name,
      email: email,
      password: "$2b$10$op0X4SAz1G2ysgUet/ZbX.xwGuZRE4I7xlHcsG8fYjqZ5xWuw3/0K",
      role: role,
    });

    console.log(user);
    res.send(user);
  } catch (e) {
    res.send(e.message);
  }
});
module.exports = router;
