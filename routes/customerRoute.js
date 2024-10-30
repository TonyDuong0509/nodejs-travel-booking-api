const express = require("express");
const router = express.Router();
const {
  authenticateUser,
  authorizePermission,
} = require("./../middlewares/authentication");
const customerController = require("./../controllers/customerController");

router.get(
  "/show-me",
  [authenticateUser, authorizePermission("Admin", "Customer")],
  customerController.showMe
);
router.post(
  "/update-profile",
  [authenticateUser, authorizePermission("Admin", "Customer")],
  customerController.updateProfile
);
router.post(
  "/upload-logo",
  [authenticateUser, authorizePermission("Admin", "Customer")],
  customerController.uploadLogo
);
router.post(
  "/wishlists/:roomId",
  [authenticateUser, authorizePermission("Customer")],
  customerController.changeWishlist
);
router.get(
  "/all-wishlists",
  [authenticateUser, authorizePermission("Customer")],
  customerController.allWishlists
);

module.exports = router;
