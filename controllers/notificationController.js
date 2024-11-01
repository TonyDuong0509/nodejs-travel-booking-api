const { StatusCodes } = require("http-status-codes");
const CustomAPIError = require("./../errors");
const Notification = require("./../models/NotificationModel");
const User = require("./../models/UserModel");
const { checkPermissions } = require("./../utils/index");

const createNotification = async (userId, message, link) => {
  await Notification.create({ user: userId, message: message, link: link });
};

const getAllNotifications = async (req, res) => {
  const { userId } = req.user;

  const user = await User.findById({ _id: userId });
  if (!user) {
    throw new CustomAPIError.NotFoundError(
      `Not found user with this ID: ${userId}`
    );
  }

  let notifications;

  if (
    (user && user.role === "Admin") ||
    (user && user.role === "Hotel") ||
    (user && user.role === "Customer")
  ) {
    notifications = await Notification.find({ user: user._id })
      .sort("-createdAt")
      .select("-_id -user");
  }

  if (!notifications || notifications.length === 0) {
    throw new CustomAPIError.NotFoundError("You don't have any notification");
  }

  res.status(StatusCodes.OK).json({ notifications });
};

const readNotification = async (req, res) => {
  const { userId } = req.user;
  const { notificationId } = req.params;

  const user = await User.findById({ _id: userId });
  if (!user) {
    throw new CustomAPIError.NotFoundError(
      "Please login to check your notifications"
    );
  }

  const notification = await Notification.findByIdAndUpdate(
    { _id: notificationId },
    { isRead: true },
    { new: true }
  );

  checkPermissions(req.user, notification.user);

  res.status(StatusCodes.OK).json({ notification });
};

module.exports = { createNotification, getAllNotifications, readNotification };
