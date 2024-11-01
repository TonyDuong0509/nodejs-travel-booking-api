const express = require("express");
const router = express.Router();
const bookingController = require("./../controllers/bookingController");
const {
  authenticateUser,
  authorizePermission,
} = require("./../middlewares/authentication");

router.post(
  "/booking-room",
  [authenticateUser, authorizePermission("Customer")],
  bookingController.createBooking
);
router.post(
  "/cancel",
  [authenticateUser, authorizePermission("Customer")],
  bookingController.cancelBooking
);
router.get(
  "/my-bookings",
  [authenticateUser, authorizePermission("Customer")],
  bookingController.getCustomerBookings
);
router.get(
  "/hotel-bookings-pending",
  [authenticateUser, authorizePermission("Admin", "Hotel")],
  bookingController.hotelCheckBookingPending
);
router.get(
  "/details-booking/:bookingId",
  [authenticateUser, authorizePermission("Admin", "Hotel", "Customer")],
  bookingController.getDetailsBooking
);
router.post(
  "/change-status/:bookingId",
  [authenticateUser, authorizePermission("Admin", "Hotel")],
  bookingController.hotelChangeStatus
);

module.exports = router;
