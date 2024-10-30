const mongoose = require("mongoose");

const CustomerSchema = new mongoose.Schema(
  {
    wishlists: [
      {
        type: mongoose.Types.ObjectId,
        ref: "Room",
      },
    ],
    user: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

CustomerSchema.pre("save", function () {
  const now = new Date();
  this.updatedAt = now;
  if (!this.createdAt) {
    this.createdAt = now;
  }

  // Convert UTC time to Vietnam time (GMT+7)
  this.createdAt = new Date(this.createdAt.getTime() + 7 * 60 * 60 * 1000);
  this.updatedAt = new Date(this.updatedAt.getTime() + 7 * 60 * 60 * 1000);
});

module.exports = mongoose.model("Customer", CustomerSchema);
