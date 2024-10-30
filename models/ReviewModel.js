const mongoose = require("mongoose");

const ReviewSchema = new mongoose.Schema(
  {
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: [true, "Please provide rating"],
    },
    title: {
      type: String,
      trim: true,
      maxlength: 100,
      required: [true, "Please provide review title"],
    },
    comment: {
      type: String,
      required: [true, "Please provide review comment"],
    },
    user: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
    room: {
      type: mongoose.Types.ObjectId,
      ref: "Room",
      required: true,
    },
  },
  { timestamps: true }
);

ReviewSchema.index({ room: 1, user: 1 }, { unique: true });

ReviewSchema.statics.calculateAverageRating = async function (roomId) {
  const result = await this.aggregate([
    { $match: { room: roomId } },
    {
      $group: {
        _id: null,
        averageRating: { $avg: "$rating" },
        numOfReviews: { $sum: 1 },
      },
    },
  ]);
  try {
    await this.model("Room").findOneAndUpdate(
      {
        _id: roomId,
      },
      {
        averageRating: Math.ceil(result[0]?.averageRating || 0),
        numOfReviews: result[0].numOfReviews || 0,
      }
    );
  } catch (error) {
    console.log(error);
  }
};

ReviewSchema.pre("save", function () {
  const now = new Date();
  this.updatedAt = now;
  if (!this.createdAt) {
    this.createdAt = now;
  }

  // Convert UTC time to Vietnam time (GMT+7)
  this.createdAt = new Date(this.createdAt.getTime() + 7 * 60 * 60 * 1000);
  this.updatedAt = new Date(this.updatedAt.getTime() + 7 * 60 * 60 * 1000);
});

ReviewSchema.post("save", async function () {
  await this.constructor.calculateAverageRating(this.room);
});

ReviewSchema.post(
  "deleteOne",
  { document: true, query: false },
  async function () {
    await this.constructor.calculateAverageRating(this.room);
  }
);

module.exports = mongoose.model("Review", ReviewSchema);
