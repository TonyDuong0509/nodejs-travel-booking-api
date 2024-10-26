const mongoose = require("mongoose");

const HotelSchema = new mongoose.Schema(
  {
    slug: String,
    description: String,
    rating: {
      type: Number,
      default: 0,
    },
    images: [
      {
        url: { type: String, required: true },
        isFeatured: { type: Boolean, default: false },
      },
    ],
    category: {
      type: mongoose.Types.ObjectId,
      ref: "Category",
    },
    highlights: [
      {
        icon: String,
        name: String,
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

HotelSchema.pre("save", function () {
  const now = new Date();
  this.updatedAt = now;
  if (!this.createdAt) {
    this.createdAt = now;
  }

  // Convert UTC time to Vietnam time (GMT+7)
  this.createdAt = new Date(this.createdAt.getTime() + 7 * 60 * 60 * 1000);
  this.updatedAt = new Date(this.updatedAt.getTime() + 7 * 60 * 60 * 1000);
});

module.exports = mongoose.model("Hotel", HotelSchema);
