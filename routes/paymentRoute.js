const express = require("express");
const router = express.Router();
const {
  authenticateUser,
  authorizePermission,
} = require("./../middlewares/authentication");
const paymentController = require("./../controllers/paymentController");

router.post(
  "/create-payment-intent",
  [authenticateUser, authorizePermission("Customer")],
  paymentController.stripePayment
);
router.post(
  "/confirm-payment",
  [authenticateUser, authorizePermission("Customer")],
  paymentController.confirmPayment
);

module.exports = router;
