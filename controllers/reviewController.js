const { StatusCodes } = require("http-status-codes");
const CustomAPIError = require("./../errors");
const Review = require("./../models/ReviewModel");
const User = require("./../models/UserModel");
const Room = require("./../models/RoomModel");
const { checkPermissions } = require("./../utils/index");

const createReview = async (req, res) => {
  const { userId } = req.user;
  const { rating, title, comment, roomId } = req.body;

  const user = await User.findById({ _id: userId });
  if (!user) {
    throw new CustomAPIError.NotFoundError("Please login to review room");
  }

  const isValidRoom = await Room.findById({ _id: roomId });
  if (!isValidRoom) {
    throw new CustomAPIError.NotFoundError(
      `Not found room with this ID: ${roomId}`
    );
  }

  const alreadyReviewed = await Review.findOne({
    room: roomId,
    user: userId,
  });

  if (alreadyReviewed) {
    throw new CustomAPIError.BadRequestError("Already reviewed for this room");
  }

  const review = await Review.create({
    rating: rating,
    title: title,
    comment: comment,
    user: userId,
    room: roomId,
  });

  res.status(StatusCodes.CREATED).json({ review });
};

const getSingleReview = async (req, res) => {
  const { reviewId } = req.params;
  const review = await Review.findById({ _id: reviewId });
  if (!review) {
    throw new CustomAPIError.NotFoundError(
      `Not found review with this ID: ${reviewId}`
    );
  }
  res.status(StatusCodes.OK).json({ review });
};

const updateReview = async (req, res) => {
  const { userId } = req.user;
  const { reviewId } = req.params;
  const { rating, title, comment } = req.body;

  const user = await User.findById({ _id: userId });
  if (!user) {
    throw new CustomAPIError.NotFoundError("Please login to update review");
  }
  const review = await Review.findById({ _id: reviewId });
  if (!review) {
    throw new CustomAPIError.NotFoundError(
      `Not found review with this ID: ${reviewId}`
    );
  }

  checkPermissions(req.user, review.user);

  review.rating = rating;
  review.title = title;
  review.comment = comment;

  await review.save();
  res.status(StatusCodes.OK).json({ review });
};

const deleteReview = async (req, res) => {
  const { userId } = req.user;
  const { reviewId } = req.params;

  const user = await User.findById({ _id: userId });
  if (!user) {
    throw new CustomAPIError.NotFoundError("Please login to update review");
  }
  const review = await Review.findById({ _id: reviewId });
  if (!review) {
    throw new CustomAPIError.NotFoundError(
      `Not found review with this ID: ${reviewId}`
    );
  }

  checkPermissions(req.user, review.user);

  await review.deleteOne();
  res
    .status(StatusCodes.NO_CONTENT)
    .json({ message: "Delete review successfully" });
};

const getAllByRoomId = async (req, res) => {
  const { roomId } = req.params;

  const room = await Room.findById({ _id: roomId });
  if (!room) {
    throw new CustomAPIError.NotFoundError(
      `Not found room with this ID: ${roomId}`
    );
  }

  const reviews = await Review.find({ room: roomId })
    .populate({
      path: "user",
      select: "-_id fullName email",
    })
    .select("-_id -room");

  res.status(StatusCodes.OK).json({ reviews });
};

module.exports = {
  createReview,
  getSingleReview,
  updateReview,
  deleteReview,
  getAllByRoomId,
};
