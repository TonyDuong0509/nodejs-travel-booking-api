const mongoose = require("mongoose");
const { isEmail } = require("validator");
const bcrypt = require("bcrypt");

const UserSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "Please provide name"],
    },
    phone: {
      type: String,
      required: [true, "Please provide phone"],
    },
    address: {
      type: String,
      required: [true, "Please provide address"],
    },
    email: {
      type: String,
      required: [true, "Please provide email"],
      validate: [isEmail, "Invalid email"],
      unique: true,
    },
    password: {
      type: String,
      required: [true, "Please provide password"],
    },
    isLogged: {
      type: Boolean,
      default: false,
    },
    role: {
      type: String,
      enum: ["Admin", "Hotel", "Customer"],
      required: true,
    },
    avatar: String,
    verificationToken: String,
    isVerified: {
      type: Boolean,
      default: false,
    },
    verified: Date,
  },
  { timestamps: true }
);

UserSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

UserSchema.pre("save", function () {
  const now = new Date();
  this.updatedAt = now;
  if (!this.createdAt) {
    this.createdAt = now;
  }

  // Convert UTC time to Vietnam time (GMT+7)
  this.createdAt = new Date(this.createdAt.getTime() + 7 * 60 * 60 * 1000);
  this.updatedAt = new Date(this.updatedAt.getTime() + 7 * 60 * 60 * 1000);
});

UserSchema.methods.comparePassword = async function (candidatePassword) {
  const isValid = await bcrypt.compare(candidatePassword, this.password);
  return isValid;
};

module.exports = mongoose.model("User", UserSchema);
