const mongoose = require("mongoose");

const RoomSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide room name"],
    },
    slug: String,
    roomType: {
      type: String,
      required: [true, "Please provide room type"],
    },
    description: {
      type: String,
      required: [true, "Please provide description"],
    },
    pricePerNight: {
      type: Number,
      required: [true, "Please provide room price"],
    },
    capacity: {
      type: Number,
      required: true,
    },
    amenities: [
      {
        icon: String,
        name: String,
      },
    ],
    images: [
      {
        url: { type: String, required: true },
        description: String,
      },
    ],
    availability: [
      {
        date: Date,
        status: {
          type: String,
          enum: ["available", "booked"],
        },
      },
    ],
    hotel: {
      type: mongoose.Types.ObjectId,
      ref: "Hotel",
      required: true,
    },
  },
  { timestamps: true }
);

RoomSchema.pre("save", function () {
  const now = new Date();
  this.updatedAt = now;
  if (!this.createdAt) {
    this.createdAt = now;
  }

  // Convert UTC time to Vietnam time (GMT+7)
  this.createdAt = new Date(this.createdAt.getTime() + 7 * 60 * 60 * 1000);
  this.updatedAt = new Date(this.updatedAt.getTime() + 7 * 60 * 60 * 1000);
});

module.exports = mongoose.model("Room", RoomSchema);
