const express = require("express");
const router = express.Router();
const {
  authenticateUser,
  authorizePermission,
} = require("./../middlewares/authentication");
const reviewController = require("./../controllers/reviewController");

router.get("/all-reviews-room/:roomId", reviewController.getAllByRoomId);
router.post(
  "/add-review",
  [authenticateUser, authorizePermission("Customer")],
  reviewController.createReview
);
router.get("/single-review/:reviewId", reviewController.getSingleReview);
router.patch(
  "/update-review/:reviewId",
  [authenticateUser, authorizePermission("Admin", "Customer")],
  reviewController.updateReview
);
router.get(
  "/delete-review/:reviewId",
  [authenticateUser, authorizePermission("Admin", "Customer")],
  reviewController.deleteReview
);

module.exports = router;
