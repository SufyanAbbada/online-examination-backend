const mongoose = require("mongoose");
const { Schema } = mongoose;

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
  verified: {
    type: Boolean,
    required: true,
    default: false,
  },
});

const User = mongoose.model("User", userSchema);

module.exports = User;
