const express = require("express");
const router = express.Router();
const {
  authenticateUser,
  authorizePermission,
} = require("./../middlewares/authentication");
const notificationController = require("./../controllers/notificationController");

router.get(
  "/get-all",
  [authenticateUser, authorizePermission("Admin", "Hotel", "Customer")],
  notificationController.getAllNotifications
);
router.get(
  "/read-notification/:notificationId",
  [authenticateUser, authorizePermission("Admin", "Hotel", "Customer")],
  notificationController.readNotification
);

module.exports = router;
