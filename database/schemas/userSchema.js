const mongoose = require("mongoose");
const { Schema } = mongoose;
const { USER_ROLES } = require("../../constants");

const userSchema = new Schema({
  name: {
    type: String,
    minLength: 3,
    maxLength: 40,
    required: true,
    validate: {
      validator: function (v) {
        return /^[A-Za-z\s]+$/.test(v);
      },
      message: (props) => `${props.value} is not a valid name!`,
    },
  },

  email: {
    type: String,
    minLength: 3,
    maxLength: 40,
    required: true,
    unique: true,
    index: true,
    validate: {
      validator: function (v) {
        return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(v);
      },
      message: (props) => `${props.value} is not a valid format for Email!`,
    },
  },
  password: {
    type: String,
    minLength: 60,
    maxLength: 60,
    required: true,
    validate: {
      validator: function (v) {
        return /^(?=.*[A-Za-z])(?=.*[0-9])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).*$/.test(
          v
        );
      },
      message: (props) =>
        `${props.value} must contain alphabets, numbers and special characters!`,
    },
  },
  role: {
    type: String,
    required: true,
    default: "student",
    validate: {
      validator: function (v) {
        return USER_ROLES.includes(v);
      },
      message: (props) =>
        `${props.value} is not a valid role! Only "student", "teacher", or "admin" are allowed.`,
    },
  },
  approved: {
    type: Boolean,
    default: false,
  },
  verified: {
    type: Boolean,
    required: true,
    default: false,
  },
  expiresAt: {
    type: Date,
    expires: 1800,
  },
});

const User = mongoose.model("User", userSchema);

module.exports = User;
