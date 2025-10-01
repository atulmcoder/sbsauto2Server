const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, "First name is required"],
    trim: true
  },
  lastName: {
    type: String,
    required: [true, "Last name is required"],
    trim: true
  },
 email: { type: String, required: true },
mobile: { type: String },

  message: {
    type: String,
    trim: true
  }
}, { timestamps: true });

const User = mongoose.model("User", userSchema);

module.exports = User;
